import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Config, loadConfig } from '../../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import VNCDockerContainerBase, {
  ConnectionDataDockerContainer, ConnectionTypeDockerContainer
} from './VNCDockerContainer/VNCDockerContainerBase'
import { ReconnectData } from './VNCConnection'
import { TARGET_LABEL_STOP_AFTER_DISCONNECT, TargetDockerContainerOptions } from '../targets/TargetDockerContainer'
import DockerContainer from '../../docker/Container'


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
    this.target.options = this.getTargetOptionsFromData(this.data)

    return super._connect<ConnectionDataDockerContainer>(sessionName, this.data, {...this.target.optionLabels, ...labels})
  }

  async reconnect(data: ReconnectData<ConnectionTypeDockerContainer, ConnectionDataDockerContainer>) {
    const reconnectData = await this.getReconnectData(data)

    if (data.type === 'proxy')
      reconnectData.connectionData = {
        ...reconnectData.connectionData,
        ...this.getOptionLabelsFromProxyContainer(),
      }

    await this.connect(reconnectData.sessionName, reconnectData.connectionData)
  }

  async disconnect() {
    const targetContainerId = this.target.getContainerId()
    const stopTargetContainer = this.target.options?.stopAfterDisconnect

    await super.disconnect()

    if (targetContainerId && stopTargetContainer) {
      const targetContainer = new DockerContainer(targetContainerId, this.docker)

      await targetContainer.stop()
    }
  }

  getOptionLabelsFromProxyContainer(): TargetDockerContainerOptions {
    return {
      stopAfterDisconnect: this.proxy.getLabel(TARGET_LABEL_STOP_AFTER_DISCONNECT) === 'true',
    }
  }

  getTargetOptionsFromData(data: TargetDockerContainerOptions): TargetDockerContainerOptions {
    return {
      stopAfterDisconnect: data.stopAfterDisconnect || false,
    }
  }

  getActiveSessionData(): ConnectionDockerContainer {
    return {
      type: this.type,
      data: this.data,
    }
  }
}
