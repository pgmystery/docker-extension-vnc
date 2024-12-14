import { Docker as DockerClient } from '@docker/extension-api-client-types/dist/v1'
import DockerCliNetwork from './cli/Network'
import { DockerNetworkContainer, DockerNetworkInfo } from '../../types/docker/cli/network'


export default class Network {
  protected readonly docker: DockerClient
  public readonly name: string

  constructor(docker: DockerClient, name: string) {
    this.docker = docker
    this.name = name
  }

  async exist(): Promise<boolean> {
    const network = await this.getInfoData()

    if (!network) return false

    return network.Name === this.name
  }

  getInfoData() {
    const dockerCliNetwork = new DockerCliNetwork(this.docker)

    return dockerCliNetwork.get(this.name)
  }

  async containers(): Promise<DockerNetworkContainer[]> {
    const containers: DockerNetworkContainer[] = []
    const networkInfo = await this.inspect()

    if (!networkInfo)
      return containers

    for (const [containerId, containerNetworkInfo] of Object.entries(networkInfo.Containers)) {
      containers.push({
        Id: containerId,
        ...containerNetworkInfo,
      })
    }

    return containers
  }

  async inspect() {
    const networkInfoExecResult = await this.docker.cli.exec('network', [
      'inspect',
      '--format', '"json"',
      this.name
    ])

    if (networkInfoExecResult.stderr)
      return

    return networkInfoExecResult.parseJsonObject()[0] as DockerNetworkInfo
  }

  async remove({force}={force: false}) {
    if (force) {
      await this.removeAllContainers()
    }

    return this.docker.cli.exec('network', [
      'rm',
      this.name,
    ])
  }

  protected create(options: string[]) {
    return this.docker.cli.exec('network', [
      'create',
      ...options,
      this.name,
    ])
  }

  protected addContainer(containerId: string) {
    return this.docker.cli.exec('network', [
      'connect',
      this.name,
      containerId,
    ])
  }

  protected removeContainer(containerId: string, {force}={force:false}) {
    return this.docker.cli.exec('network', [
      'disconnect',
      force ? '--force' : '',
      this.name,
      containerId,
    ])
  }

  protected async removeAllContainers() {
    const containersInNetwork = await this.containers()
    const removeContainerPromiseList = containersInNetwork.map(
      container => this.removeContainer(container.Id, { force: true })
    )

    return Promise.all(removeContainerPromiseList)
  }
}
