import TargetDockerContainer from './TargetDockerContainer'
import DockerContainer, { ContainerAlreadyExistError } from '../../docker/Container'
import DockerCli from '../../docker/DockerCli'
import eventBus from '../../EventBus'


export interface TargetDockerImageOptions {
  deleteContainerAfterDisconnect: boolean
}

export const TARGET_LABEL_DELETE_AFTER_DISCONNECT = 'pgmystery.vnc.extension.connection.target.image.delete'


export default class TargetDockerImage extends TargetDockerContainer {
  #imageOptions: TargetDockerImageOptions | null = null
  private isTryingToConnect: boolean = false

  async connect(container: string, port: number) {
    this.isTryingToConnect = true

    try {
      await super.connect(container, port)
    }
    catch (e: any) {
      console.error(e)

      this.isTryingToConnect = false
      await this.disconnect()
    }

    this.isTryingToConnect = false
  }

  async disconnect() {
    const dockerContainer = this.dockerContainer

    await super.disconnect()

    if (this.isTryingToConnect)
      return

    if (this.imageOptions?.deleteContainerAfterDisconnect && dockerContainer?.exist()) {
      await dockerContainer?.delete({force: true})
    }
  }

  async create(dockerImage: string, options: string[] = [], cmds: string[] = []) {
    if (this.dockerContainer?.exist())
      return

    if (this.dockerContainer) {
      try {
        const result = await this.dockerContainer.createContainer(dockerImage, options, cmds)

        return result.stdout
      }
      catch (e) {
        if (e instanceof ContainerAlreadyExistError) {
          return this.dockerContainer.container?.Id
        }

        throw e
      }
    }
    else {
      const dockerCli = new DockerCli(this.docker)

      if (!await dockerCli.imageExist(dockerImage)) {
        await eventBus.emit('pullImage', dockerImage)
      }

      const result = await dockerCli.execCli('run', [
        ...options,
        '-d',
        dockerImage,
        ...cmds
      ])
      const containerId = result.stdout
      this.dockerContainer = new DockerContainer(containerId, this.docker)

      return containerId
    }
  }

  async delete() {
    await this.dockerContainer?.delete({force: true})
  }

  set imageOptions(imageOptions: TargetDockerImageOptions) {
    this.#imageOptions = imageOptions
  }

  get imageOptions(): TargetDockerImageOptions | null {
    return this.#imageOptions
  }

  get imageOptionsLabel() {
    if (!this.imageOptions)
      throw new Error('No image-options specified')

    const { deleteContainerAfterDisconnect } = this.imageOptions

    return {
      [TARGET_LABEL_DELETE_AFTER_DISCONNECT]: `${deleteContainerAfterDisconnect}`,
    }
  }
}
