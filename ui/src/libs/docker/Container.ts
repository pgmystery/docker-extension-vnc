import { Container as ContainerInfo,  DockerListContainersFilters } from '../../types/docker/extension'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { ContainerExtended } from '../../types/docker/cli/inspect'


export class MultipleContainersFoundError extends Error {
  containers: ContainerInfo[]

  constructor(containers: ContainerInfo[], _?: string, options?: ErrorOptions) {
    super('Found multiple containers, but expected only 1', options)

    this.containers = containers
  }
}
export class ContainerAlreadyExistError extends Error {}
export class ContainerDontExistError extends Error {}


export default class Container {
  protected docker: Docker
  protected filters: DockerListContainersFilters
  public container: ContainerInfo | undefined

  constructor(filters: DockerListContainersFilters={}, docker?: Docker) {
    if (!docker)
      docker = createDockerDesktopClient().docker

    this.docker = docker
    this.filters = filters
  }

  async get() {
    this.container = undefined

    const containers = await this.docker.listContainers({
      all: true,
      filters: this.filters,
    }) as ContainerInfo[]

    if (containers.length > 1) throw new MultipleContainersFoundError(containers)

    if (containers.length === 0) return false

    this.container = containers[0]

    return true
  }

  protected async createContainer(dockerImage: string, args: string[] = [], cmds: string[] = []) {
    if (this.container) throw new ContainerAlreadyExistError()

    return this.docker.cli.exec('run', [...args, dockerImage, ...cmds])
  }

  async delete({force}={force: false}) {
    if (!this.container) {
      const containerExist = await this.get()

      if (!containerExist || !this.container) throw new ContainerDontExistError()
    }

    const rmExecResult = await this.docker.cli.exec('rm', [
      force ? '--force' : '',
      this.container.Id
    ])
    this.container = undefined

    return rmExecResult
  }

  async inspect() {
    if (!this.container) {
      const containerExist = await this.get()

      if (!containerExist || !this.container) throw new ContainerDontExistError()
    }

    const execResult = await this.docker.cli.exec('inspect', [
      '--format','"json"',
      this.container.Id
    ])

    if (execResult.stderr) throw new Error(execResult.stderr)

    return execResult.parseJsonObject()[0] as ContainerExtended
  }

  exist() {
    return !!this.container
  }

  withContainer() {
    if (!this.exist()) throw new ContainerDontExistError()
  }
}
