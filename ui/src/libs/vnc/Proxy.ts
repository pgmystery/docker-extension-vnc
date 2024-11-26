import { Config, loadConfig } from '../../hooks/useConfig'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import { Container, DockerImage, DockerListContainersFilters } from '../../types/docker/extension'
import DockerContainer, { MultipleContainersFoundError } from '../docker/Container'
import { ContainerExtended } from '../../types/docker/cli/inspect'
import ProxyNetwork from './ProxyNetwork'
import MultiExecResult from '../docker/MultiExecResult'

export interface URL {
  ws: string
  browser: string
}

export class ContainerDeleteError extends Error {}

export default class Proxy extends DockerContainer {
  private readonly config: Config
  private readonly proxyNetwork: ProxyNetwork
  public containerExtended: ContainerExtended | undefined
  public readonly ready: Promise<void>

  constructor(docker?: Docker, config?: Config) {
    if (!docker)
      docker = createDockerDesktopClient().docker

    if (!config)
      config = loadConfig()

    const proxyContainerFilter: DockerListContainersFilters = {
      label: [
        config.proxyContainerLabelKey,
      ],
    }
    super(proxyContainerFilter, docker)

    this.config = config
    this.proxyNetwork = new ProxyNetwork(docker, config)

    this.ready = new Promise((resolve, reject) => {
      this.get().then(() => resolve()).catch(e => reject(e))
    })
  }

  getTargetContainerId(): string {
    this.withContainer()

    const targetContainerId = this.containerExtended?.Config.Labels[this.config.proxyContainerLabelContainerId]

    if (!targetContainerId)
      throw new Error(
        `The proxy-container "${this.container?.Id}" has no label with the key "${this.config.proxyContainerLabelContainerId}"`
      )

    return targetContainerId
  }

  getTargetPort(): number {
    this.withContainer()

    const targetPort = this.containerExtended?.Config.Labels[this.config.proxyContainerLabelTargetPort]

    if (!targetPort)
      throw new Error(
        `The proxy-container "${this.container?.Id}" has no label with the key "${this.config.proxyContainerLabelTargetPort}"`
      )

    return Number(targetPort)
  }

  get port(): number {
    this.withContainer()

    return Number(this.containerExtended?.NetworkSettings.Ports[`${this.config.proxyContainerLocalPort}/tcp`][0].HostPort)
  }

  get url(): URL {
    return {
      ws: `ws://localhost:${this.port}/websockify`,
      browser: `http://localhost:${this.port}/vnc.html`
    }
  }

  async get() {
    const gotDockerContainer = await super.get()
    if (!gotDockerContainer || !this.container) return false

    if (this.container.State !== 'running') {
      await this.delete()

      return false
    }

    const isInNetwork = await this.proxyNetwork.hasContainer(this.container.Id)
    if (!isInNetwork) {
      await this.delete()

      return false
    }

    this.containerExtended = await this.inspect()

    return true
  }

  async update() {
    const gotDockerContainer = await super.get()
    if (!gotDockerContainer || !this.container) return false

    this.containerExtended = await this.inspect()

    return true
  }

  async create(targetContainerId: string, targetIp: string, targetPort: number) {
    await this.get()

    const isTargetInNetwork = await this.proxyNetwork.hasContainer(targetContainerId)
    if (!isTargetInNetwork)
      return false

    if (this.container) {
      const isInNetwork = await this.proxyNetwork.hasContainer(this.container.Id)
      if (!isInNetwork)
        await this.delete()

      const targetContainer = new DockerContainer({
        id: [targetContainerId]
      }, this.docker)
      const targetContainerExist = await targetContainer.get()
      if (!targetContainerExist || !targetContainer.container)
        throw new Error(`Target container with the id "${targetContainerId}" don't exist`)

      const containerTargetIp = targetContainer.container.NetworkSettings.Networks[this.proxyNetwork.name].IPAddress

      if (
        this.getTargetContainerId() !== targetContainerId
        || containerTargetIp !== targetIp
        || this.getTargetPort() !== targetPort
      ) {
        await this.delete()
      }
      else {
        return true
      }
    }

    const {
      proxyContainerLabelKey,
      proxyContainerLabelContainerId,
      proxyContainerLabelTargetIp,
      proxyContainerLabelTargetPort
    } = this.config

    const labelIdentify = `${proxyContainerLabelKey}=""`
    const labelTargetContainerId = `${proxyContainerLabelContainerId}=${targetContainerId}`
    const labelTargetIp = `${proxyContainerLabelTargetIp}=${targetIp}`
    const labelTargetPort = `${proxyContainerLabelTargetPort}=${targetPort}`

    const createExecResult = await super.createContainer(this.config.proxyDockerImage, [
      '--detach',
      '--label', labelIdentify,
      '--label', labelTargetContainerId,
      '--label', labelTargetIp,
      '--label', labelTargetPort,
      '--network', this.config.network,
      '-p', `"${this.config.proxyContainerLocalPort.toString()}"`,
      '-e', `"NONVC_REMOTE_SERVER=${targetIp}:${targetPort}"`,
    ])
    if (createExecResult.stderr) throw new Error(createExecResult.stderr)

    return this.get()
  }

  async delete() {
    await this.update()
    if (!this.exist()) return new MultiExecResult()

    const execResult = await super.delete({force: true})
    if (execResult.stderr)
      throw new Error(execResult.stderr)

    try {
      const gotContainer = await this.get()

      if (gotContainer) throw new ContainerDeleteError('Can\' delete the proxy container')
    }
    catch (e) {
      if (e instanceof MultipleContainersFoundError) {
        const multiExecResult = new MultiExecResult(execResult)

        const proxyContainers = await this.docker.listContainers({
          all: true,
          filters: this.filters
        }) as Container[]

        const deleteProxyContainersExecResult = await this.docker.cli.exec('rm', [
          '--force',
          ...proxyContainers.map(container => container.Id)
        ])
        if (deleteProxyContainersExecResult.stderr)
          throw new ContainerDeleteError(deleteProxyContainersExecResult.stderr)

        multiExecResult.addExecResult(deleteProxyContainersExecResult)

        return multiExecResult
      }

      throw e
    }

    return execResult
  }

  async dockerImageExist(): Promise<boolean> {
    const images = await this.docker.listImages({
      filters: {
        reference: [this.config.proxyDockerImage]
      }
    }) as DockerImage[]

    if (images.length > 1)
      throw new Error(`Found no or multiple docker images with tag "${this.config.proxyDockerImage}"`)

    return images.length === 1
  }

  pullDockerImage(addStdout: (stdout: string)=>void, onFinish: (exitCode: number)=>void) {
    this.docker.cli.exec('pull', [this.config.proxyDockerImage], {
      stream: {
        onOutput(data) {
          if (data.stdout) {
            addStdout(data.stdout)
          }

          if (data.stderr) {
            throw new Error(data.stderr)
          }
        },
        onError(error) {
          throw error
        },
        onClose(exitCode) {
          onFinish(exitCode)
        },
        splitOutputLines: true,
      },
    })
  }
}
