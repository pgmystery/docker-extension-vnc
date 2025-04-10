import { Config, loadConfig } from '../../../hooks/useConfig'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import VNCDockerContainerBase, { ConnectionDataDockerContainer } from './VNCDockerContainer/VNCDockerContainerBase'
import { ReconnectData } from './VNCConnection'
import TargetDockerImage, {
  TARGET_LABEL_DELETE_AFTER_DISCONNECT,
  TargetDockerImageOptions
} from '../targets/TargetDockerImage'
import ProxyNetwork from '../ProxyNetwork'


export type ConnectionTypeDockerImage = 'image'
export interface ConnectionDockerImage {
  type: ConnectionTypeDockerImage
  data: ConnectionDataDockerImage
}

export interface ConnectionDataDockerImage extends TargetDockerImageOptions {
  port: number
  image: string
  imageTag: string
  containerRunOptions: string
  containerRunArgs: string
}
export type ConnectionDataDockerImageWithOptions = ConnectionDataDockerContainer & TargetDockerImageOptions
export interface ConnectionDockerImageActiveSession {
  type: ConnectionTypeDockerImage
  data: ConnectionDataDockerImageWithOptions | null
}


export default class VNCDockerImage extends VNCDockerContainerBase {
  declare target: TargetDockerImage
  public type: ConnectionTypeDockerImage = 'image'

  data: ConnectionDataDockerImageWithOptions | null = null

  constructor(props: {docker?: Docker, config?: Config}) {
    const docker = props.docker || createDockerDesktopClient().docker
    const config = props.config || loadConfig()

    const proxyNetwork = new ProxyNetwork(docker, config)
    const target = new TargetDockerImage(proxyNetwork, docker, config)

    super(docker, config, target)
  }

  async reconnect(data: ReconnectData<ConnectionTypeDockerImage, ConnectionDataDockerImageWithOptions>) {
    const { sessionName, connectionData } = await this.getReconnectData(data)

    switch (data.type) {
      case 'proxy':
        this.target.imageOptions = this.getOptionLabelsFromProxyContainer()

        break
      case 'activeSession':
        this.target.imageOptions = this.getTargetOptionsFromData(data.data)

        break
    }

    await this.connectToContainer(sessionName, connectionData.container, connectionData.port, this.target.imageOptions)
  }

  async connect(sessionName: string, data: ConnectionDataDockerImage) {
    const targetContainerId = await this.createTargetContainer(data)

    if (!targetContainerId)
      return false

    this.target.imageOptions = this.getTargetOptionsFromData(data)

    return this.connectToContainer(sessionName, targetContainerId, data.port, this.target.imageOptions)
  }

  async connectToContainer(sessionName: string, targetContainerId: string, port: number, imageOptions: TargetDockerImageOptions) {
    const dockerConnectData = await this.getContainerConnectData({
      container: targetContainerId,
      port,
    })

    this.data = {
      ...dockerConnectData,
      ...imageOptions,
    }

    return super._connect(sessionName, dockerConnectData, this.target.imageOptionsLabel)
  }

  createTargetContainer(data: ConnectionDataDockerImage) {
    const {
      image,
      imageTag,
      containerRunOptions,
      containerRunArgs,
    } = data

    try {
      return this.target.create(image + ':' + imageTag, [containerRunOptions], [containerRunArgs])
    }
    catch (_) {
      return
    }
  }

  getOptionLabelsFromProxyContainer(): TargetDockerImageOptions {
    return {
      deleteContainerAfterDisconnect: this.proxy.getLabel(TARGET_LABEL_DELETE_AFTER_DISCONNECT) === 'true',
    }
  }

  getTargetOptionsFromData(data: TargetDockerImageOptions): TargetDockerImageOptions {
    return {
      deleteContainerAfterDisconnect: data.deleteContainerAfterDisconnect,
    }
  }

  getActiveSessionData(): ConnectionDockerImageActiveSession {
    return {
      type: this.type,
      data: this.data,
    }
  }
}
