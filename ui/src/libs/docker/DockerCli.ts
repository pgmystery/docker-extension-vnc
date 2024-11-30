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

export default class DockerCli extends DockerCliExec {
  public network: DockerCliNetwork

  constructor(dockerClient?: DockerClient) {
    if (!dockerClient)
      dockerClient = createDockerDesktopClient().docker

    super(dockerClient)

    this.network = new DockerCliNetwork(dockerClient)
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

  async inspect(containerId: string): Promise<ContainerExtended> {
    const execResult = await this.exec('inspect', {
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

  pull(image: string, addStdout: (stdout: string)=>void, onFinish: (exitCode: number)=>void) {
    this.client.cli.exec('pull', [image], {
      stream: {
        onOutput(data) {
          if (data.stdout) {
            addStdout(data.stdout)
          }

          if (data.stderr) {
            throw new Error(data.stderr)
          }
        },
        onError(error) {
          throw error
        },
        onClose(exitCode) {
          onFinish(exitCode)
        },
        splitOutputLines: true,
      },
    })
  }

  run(image: string, options: CliExecOptions) {
    return this.exec('run', options, image)
  }

  rm(containerId: string, options: {force: boolean} = {force: false}) {
    const execOptions = options.force ? {'--force': null} : {}

    return this.exec('rm', execOptions, containerId)
  }
}
