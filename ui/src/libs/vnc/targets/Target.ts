import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Config, loadConfig } from '../../../hooks/useConfig'


export default class Target {
  protected readonly docker: Docker
  protected readonly config: Config
  public connection: {ip: string, port: number} | undefined

  constructor(docker?: Docker, config?: Config) {
    docker = docker || createDockerDesktopClient().docker
    config = config || loadConfig()

    this.docker = docker
    this.config = config
  }

  async connect(ip: string, port: number) {
    this.connection = {
      ip,
      port,
    }
  }

  async disconnect() {
    this.connection = undefined
  }

  get connected() {
    return !!this.connection
  }
}
