import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import VNCDockerContainerBase, {
  ConnectionDataDockerContainer, ConnectionTypeDockerContainer
} from './VNCDockerContainer/VNCDockerContainerBase'
import { ReconnectData } from './VNCConnection'


export interface NewConnectionDockerContainerData {
  type: ConnectionTypeDockerContainer
  data: ConnectionDataDockerContainer
}
export interface ConnectionDockerContainer {
  type: ConnectionTypeDockerContainer
  data: ConnectionDataDockerContainer | null
}


export default class VNCDockerContainer extends VNCDockerContainerBase {
  public type: ConnectionTypeDockerContainer = 'container'

  constructor(props: {docker?: Docker, config?: Config}) {
    const docker = props.docker || createDockerDesktopClient().docker
    const config = props.config || loadConfig()

    super(docker, config)
  }

  async connect(sessionName: string, data: ConnectionDataDockerContainer, labels?: {[p: string]: string}) {
    this.data = await this.getContainerConnectData(data)

    return super._connect<ConnectionDataDockerContainer>(sessionName, this.data, labels)
  }

  async reconnect(data: ReconnectData<ConnectionTypeDockerContainer, ConnectionDataDockerContainer>) {
    const reconnectData = await this.getReconnectData(data)

    await this.connect(reconnectData.sessionName, reconnectData.connectionData)
  }

  getActiveSessionData(): ConnectionDockerContainer {
    return {
      type: this.type,
      data: this.data,
    }
  }
}
