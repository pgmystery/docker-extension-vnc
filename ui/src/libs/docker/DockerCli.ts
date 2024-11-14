import { Docker as DockerClient } from '@docker/extension-api-client-types/dist/v1'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import DockerCliNetwork from './cli/Network'
import DockerCliExec from './cli/Exec'

export default class DockerCli extends DockerCliExec {
  public network: DockerCliNetwork

  constructor(dockerClient: DockerClient) {
    super(dockerClient)

    this.network = new DockerCliNetwork(dockerClient)
  }

  async inspect(containerId: string): Promise<ContainerExtended> {
    const execResult = await this.exec('inspect', {
      '--format': '"json"',
    }, containerId)

    return execResult.parseJsonObject()[0] as ContainerExtended
  }
}
