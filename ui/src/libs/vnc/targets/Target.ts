import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Config, loadConfig } from '../../../hooks/useConfig'

interface TargetConnection {
  host: string
  port: number
}

export default class Target {
  protected readonly docker: Docker
  protected readonly config: Config
  public connection: TargetConnection | undefined

  constructor(docker?: Docker, config?: Config) {
    this.docker = docker || createDockerDesktopClient().docker
    this.config = config || loadConfig()
  }

  async connect(host: string, port: number) {
    if (!host?.trim())
      throw new Error('Host cannot be empty')

    if (!this.isValidPort(port))
      throw new Error('Invalid port number')

    this.connection = {
      host: host.trim(),
      port,
    }
  }

  async disconnect() {
    this.connection = undefined
  }

  get connected() {
    return !!this.connection
  }

  private isValidPort(port: number): boolean {
    return Number.isInteger(port) && port >= 1 && port <= 65535
  }
}
