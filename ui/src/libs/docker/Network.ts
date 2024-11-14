import { Docker as DockerClient } from '@docker/extension-api-client-types/dist/v1'
import DockerCliNetwork from './cli/Network'
import { Container } from '../../types/docker/extension'


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

  containers() {
    return this.docker.listContainers({
      all: true,
      filters: {
        network: [this.name]
      }
    }) as Promise<Container[]>
  }

  remove() {
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

  protected removeContainer(containerId: string) {
    return this.docker.cli.exec('network', [
      'disconnect',
      this.name,
      containerId,
    ])
  }
}
