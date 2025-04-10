import DockerNetwork from '../docker/Network'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import MultiExecResult from '../docker/MultiExecResult'


export default class ProxyNetwork extends DockerNetwork {
  constructor(docker?: Docker, config?: Config) {
    docker = docker || createDockerDesktopClient().docker
    config = config || loadConfig()

    super(docker, config.network)
  }

  async create() {
    const execResult = await super.create([
      "--attachable",
    ])
    if (execResult.stderr)
      throw new Error(execResult.stderr)

    return execResult
  }

  async addContainer(containerId: string) {
    const networkExist = await this.exist()
    if (!networkExist)
      await this.create()

    const isInNetwork = await this.hasContainer(containerId)
    if (!isInNetwork) {
      const execResult = await super.addContainer(containerId)
      if (execResult.stderr)
        throw new Error(execResult.stderr)
    }

    return new MultiExecResult()
  }

  async removeContainer(containerId: string) {
    const isInNetwork = await this.hasContainer(containerId)
    if (!isInNetwork) {
      try {
        await super.removeContainer(containerId, {force: true})
      }
      catch {
         // Ignore errors if container is not in network
      }

      return new MultiExecResult()
    }

    const execResult = await super.removeContainer(containerId, {force: true})
    if (execResult.stderr)
      throw new Error(`Can't disconnect the container with the id "${containerId}" from the network "${this.name}"`)

    return execResult
  }

  async hasContainer(containerId: string) {
    const containers = await this.containers()

    return containers.some(container => container.Id === containerId)
  }
}
