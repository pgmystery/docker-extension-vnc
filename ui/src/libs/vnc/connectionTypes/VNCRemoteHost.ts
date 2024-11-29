import VNCConnection from './VNCConnection'
import { Config, loadConfig } from '../../../hooks/useConfig'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import Target from '../targets/Target'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import Proxy from '../proxies/Proxy'


export type ConnectionTypeRemoteHost = 'remote'

export default class VNCRemoteHost extends VNCConnection {
  public type: ConnectionTypeRemoteHost

  constructor(docker?: Docker, config?: Config) {
    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    const proxy = new Proxy(docker, config)
    const target = new Target(docker, config)

    super(proxy, target, docker, config)

    this.type = 'remote'
  }
}
