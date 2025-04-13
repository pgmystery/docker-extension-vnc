import { Docker as DockerClient } from '@docker/extension-api-client-types/dist/v1'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import DockerCliNetwork from './cli/Network'
import DockerCliExec from './cli/Exec'
import {
  ContainerInfo,
  DockerImage,
  DockerListContainersFilters
} from '../../types/docker/extension'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { CliExecOptions } from '../../types/docker/cli'
import { MultipleContainersFoundError } from './Container'
import DockerCliManifest from './cli/Manifest'
import DockerCliImage from './dockerCli/Image'

interface AbortEventTarget extends EventTarget {
  reason?: string
}

interface AbortEvent extends Event {
  target: AbortEventTarget | null
}

interface ExecStreamCommand {
  command: string
  args?: string[]
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

  async getContainerFromInspect(containerName: string, options: {throwError: boolean} = {throwError: true}) {
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

  pull(image: string, addStdout: (stdout: string)=>void, options?: ExecStreamOptions) {
    return this.execStream({
      command: 'pull',
      args: [image],
    }, addStdout, options)
  }

  run(image: string, options: CliExecOptions, args: string[] = []) {
    return this.exec('run', options, image, ...args)
  }

  rm(containerId: string, options: {force: boolean} = {force: false}) {
    const execOptions = options.force ? {'--force': null} : {}

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

  // STEAM IS NOT WORKING :( THE DOCKER-EXEC COMMAND IS BROKEN FROM THE EXTENSION. https://github.com/docker/extensions-sdk/issues/303
  commitStream(containerId: string, repository: string, addStdout: (stdout: string)=>void, options?: ExecStreamOptions) {
    return this.execStream({
      command: 'commit',
      args: [containerId, repository],
    }, addStdout, options)
  }

  private execStream(command: ExecStreamCommand, addStdout: (stdout: string)=>void, options?: ExecStreamOptions) {
    return new Promise<void>((resolve, reject) => {
      function abortListener({ target }: AbortEvent) {
        options?.abortSignal?.removeEventListener('abort', abortListener)

        reject(target?.reason || 'Unknown error')
      }

      options?.abortSignal?.addEventListener('abort', abortListener)

      return this.client.cli.exec(command.command, command.args || [], {
        stream: {
          onOutput(data) {
            if (data.stdout) {
              addStdout(data.stdout)
            }

            if (data.stderr) {
              reject(data.stderr)
            }
          },
          onError(error) {
            reject(error)
          },
          onClose(exitCode) {
            if (exitCode !== 0)
              return reject(exitCode)

            resolve()
          },
          splitOutputLines: true,
        },
      })
    })
  }
}
