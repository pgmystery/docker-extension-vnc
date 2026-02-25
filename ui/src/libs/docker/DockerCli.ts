import { Docker as DockerClient, ExecProcess } from '@docker/extension-api-client-types/dist/v1'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import DockerCliNetwork from './cli/Network'
import DockerCliExec from './cli/Exec'
import {
  ContainerInfo, DockerContainerUnsafe,
  DockerImage,
  DockerListContainersFilters
} from '../../types/docker/extension'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { CliExecOptions } from '../../types/docker/cli'
import { MultipleContainersFoundError } from './Container'
import DockerCliManifest from './cli/Manifest'
import DockerCliImage from './dockerCli/Image'
import { DockerImageInfo } from '../../types/docker/cli/image'

interface AbortEventTarget extends EventTarget {
  reason?: string
}

interface AbortEvent extends Event {
  target: AbortEventTarget | null
}

interface ExecStreamOptions {
  abortSignal?: AbortSignal
}

interface DockerHubImage {
  Description: string
  IsAutomated: 'false' | 'true'
  IsOfficial: 'false' | 'true'
  Name: string
  StarCount: string
}

export default class DockerCli extends DockerCliExec {
  public network: DockerCliNetwork
  public manifest: DockerCliManifest
  public image: DockerCliImage

  constructor(dockerClient?: DockerClient) {
    if (!dockerClient)
      dockerClient = createDockerDesktopClient().docker

    super(dockerClient)

    this.network = new DockerCliNetwork(dockerClient)
    this.manifest = new DockerCliManifest(dockerClient)
    this.image = new DockerCliImage(dockerClient)
  }

  async getContainer(filters: DockerListContainersFilters): Promise<ContainerInfo | undefined> {
    const containers = await this.client.listContainers({
      all: true,
      filters: filters,
    }) as ContainerInfo[]

    if (containers.length > 1) throw new MultipleContainersFoundError(containers)

    if (containers.length === 0) return

    return containers[0]
  }

  async getContainerFromInspect(containerName: string, options: { throwError: boolean } = { throwError: true }) {
    try {
      const execResult = await this.exec('inspect', {
        '--type': '"container"',
        '--format': '"json"',
      }, containerName)

      if (execResult.stderr) {
        if (options.throwError)
          throw new Error(execResult.stderr)
        else
          return
      }

      return execResult.parseJsonObject()[0] as ContainerExtended
    }
    catch (e) {
      if (options.throwError)
        throw e
    }
  }

  async inspect(containerId: string): Promise<ContainerExtended> {
    const execResult = await this.exec('inspect', {
      '--type': '"container"',
      '--format': '"json"',
    }, containerId)

    return execResult.parseJsonObject()[0] as ContainerExtended
  }

  async imageExist(image: string): Promise<boolean> {
    const images = await this.client.listImages({
      filters: {
        reference: [image]
      }
    }) as DockerImage[]

    if (images.length > 1)
      throw new Error(`Found no or multiple docker images with tag "${image}"`)

    return images.length === 1
  }

  pull(
    image: string,
    addStdout: (stdout: string) => void,
    options?: ExecStreamOptions
  ) {
    return this.execStream(
      'pull',
      [image],
      {
        onStdout: addStdout,
      },
      options
    )
  }

  run(image: string, options: CliExecOptions, args: string[] = []) {
    return this.exec('run', options, image, ...args)
  }

  rm(containerId: string, options: { force: boolean } = { force: false }) {
    const execOptions = options.force ? { '--force': null } : {}

    return this.exec('rm', execOptions, containerId)
  }

  start(containerId: string, options: CliExecOptions = {}) {
    return this.exec('start', options, containerId)
  }

  async search(searchString: string, limit: number = 10) {
    const searchResult = await this.exec(
      'search',
      {
        '--format': 'json',
        '--no-trunc': null,
        '--limit': limit,
      },
      searchString
    )

    return searchResult.parseJsonLines() as DockerHubImage[]
  }

  get containers() {
    return this.client.listContainers({
      all: true,
      format: 'json',
    }) as Promise<ContainerInfo[]>
  }

  get containersUnsafe() {
    return (async () => {
      const containersExecResult = await this.execCli('ps', ['-a', '--format', 'json'])

      if (containersExecResult.stderr)
        return []

      return containersExecResult.parseJsonLines() as DockerContainerUnsafe[]
    })()
  }

  listImages(options?: any) {
    return this.client.listImages({
      ...options,
      format: 'json',
    }) as Promise<DockerImage[]>
  }

  commit(containerId: string, repository: string) {
    return this.exec(
      'commit',
      {},
      containerId,
      repository,
    )
  }

  // STREAM IS NOT WORKING :( THE DOCKER-EXEC COMMAND IS BROKEN FROM THE EXTENSION. https://github.com/docker/extensions-sdk/issues/303
  // commitStream(containerId: string, repository: string, addStdout: (stdout: string)=>void, options?: ExecStreamOptions) {
  //   return this.execStream({
  //     command: 'commit',
  //     args: [containerId, repository],
  //   }, addStdout, options)
  // }

  inspectStream(
    target: string,
    options?: ExecStreamOptions
  ): Promise<DockerImageInfo[]> {
    let buffer = ''

    return this.execStream(
      'inspect',
      [target],
      {
        onStdout(chunk) {
          buffer += chunk
        },
      },
      {
        ...options,
        splitOutputLines: false, // CRITICAL for JSON
      }
    ).then(() => {
      try {
        return JSON.parse(buffer) as DockerImageInfo[]
      } catch {
        throw new Error('Failed to parse docker inspect output')
      }
    })
  }

  execStream(
    command: string,
    args: string[] = [],
    handlers: {
      onStdout?: (chunk: string) => void
      onStderr?: (chunk: string) => void
    } = {},
    options?: ExecStreamOptions & { splitOutputLines?: boolean }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let settled = false
      let proc: ExecProcess | undefined

      // Keep recent output so we can show something useful on failure
      const MAX_CHARS = 24_000
      let stdoutBuf = ''
      let stderrBuf = ''

      const appendCapped = (buf: string, chunk: string) => {
        const next = buf + chunk
        if (next.length <= MAX_CHARS) return next
        return next.slice(next.length - MAX_CHARS)
      }

      const cleanup = () => {
        options?.abortSignal?.removeEventListener('abort', onAbort)
        proc?.close()
      }

      const finish = (fn: () => void) => {
        if (settled) return
        settled = true
        cleanup()
        fn()
      }

      const onAbort = (e: AbortEvent) => {
        finish(() => reject(e.target?.reason ?? 'Aborted'))
      }

      options?.abortSignal?.addEventListener('abort', onAbort)

      proc = this.client.cli.exec(command, args, {
        stream: {
          onOutput(data) {
            if (settled) return

            if (data.stdout) {
              stdoutBuf = appendCapped(stdoutBuf, data.stdout)
              handlers.onStdout?.(data.stdout)
            }

            if (data.stderr) {
              stderrBuf = appendCapped(stderrBuf, data.stderr)
              handlers.onStderr?.(data.stderr)
            }
          },
          onError(error) {
            // Preserve buffered output; wrap into a real Error with context
            const err = error instanceof Error ? error : new Error(String(error))
            ;(err as any).stdout = stdoutBuf
            ;(err as any).stderr = stderrBuf
            finish(() => reject(err))
          },
          onClose(exitCode) {
            if (exitCode === 0) {
              finish(resolve)
              return
            }

            const msgFromStderr = stderrBuf.trim()
            const message =
              msgFromStderr.length > 0
                ? msgFromStderr
                : `Command failed with exit code ${exitCode}`

            const err = new Error(message)
            ;(err as any).exitCode = exitCode
            ;(err as any).stdout = stdoutBuf
            ;(err as any).stderr = stderrBuf

            finish(() => reject(err))
          },
          splitOutputLines: options?.splitOutputLines ?? true,
        },
      })
    })
  }

  async copyContentToContainer(containerId: string, content: string, targetPath: string): Promise<void> {
    // 0. Check if the container has the required binaries
    try {
      await Promise.all([
        this.exec('exec', {}, containerId, 'mkdir', '-p', '$(dirname "' + targetPath + '")'),
        this.exec('exec', {}, containerId, 'which', 'base64'),
        this.exec('exec', {}, containerId, 'which', 'rm'),
        this.exec('exec', {}, containerId, 'which', 'chmod'),
        this.exec('exec', {}, containerId, 'which', 'sh'),
      ])
    } catch (e) {
      throw new Error('The container is missing required binaries (base64, rm, chmod, sh) or mkdir failed.')
    }

    // 1. Encode content to base64 using Blob and FileReader to handle UTF-8 characters correctly
    const base64Content = await this.blobToBase64(new Blob([content]))

    // 2. We need to write in chunks because command line length is limited
    const chunkSize = 1000
    const totalChunks = Math.ceil(base64Content.length / chunkSize)

    // 3. Clear the file first
    await this.exec('exec', {}, containerId, 'sh', '-c', `\"echo -n '' > '${targetPath}'\"`)

    for (let i = 0; i < totalChunks; i++) {
      const chunk = base64Content.substring(i * chunkSize, (i + 1) * chunkSize)
      // Append chunk to the file
      await this.exec('exec', {}, containerId, 'sh', '-c', `\"echo -n '${chunk}' >> '${targetPath}.b64'\"`)
    }

    // 4. Decode base64 to the actual file
    await this.exec('exec', {}, containerId, 'sh', '-c', `\"base64 -d '${targetPath}.b64' > '${targetPath}'\"`)

    // 5. Cleanup temp file
    await this.exec('exec', {}, containerId, `rm ${targetPath}.b64`)

    // 6. Make executable
    await this.exec('exec', {}, containerId, `chmod +x ${targetPath}`)
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1]

          resolve(base64)
        } else {
          reject(new Error('Failed to read blob as base64'))
        }
      }

      reader.onerror = reject

      reader.readAsDataURL(blob)
    })
  }
}
