import Target from './Target'
import DockerContainer from '../../docker/Container'
import ProxyNetwork from '../ProxyNetwork'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { Config, loadConfig } from '../../../hooks/useConfig'
import { Docker } from '@docker/extension-api-client-types/dist/v1'
import DockerCli from '../../docker/DockerCli'


export interface TargetDockerContainerOptions {
  stopAfterDisconnect?: boolean
}


export const TARGET_LABEL_STOP_AFTER_DISCONNECT = 'pgmystery.vnc.extension.connection.target.container.stop'


export default class TargetDockerContainer extends Target {
  private readonly proxyNetwork: ProxyNetwork
  protected dockerContainer: DockerContainer | undefined
  public options: TargetDockerContainerOptions | null = null

  constructor(proxyNetwork: ProxyNetwork, docker?: Docker, config?: Config) {
    docker = docker || createDockerDesktopClient().docker
    config = config || loadConfig()

    super(docker, config)

    this.proxyNetwork = proxyNetwork
  }

  async connect(container: string, port: number) {
    if (this.dockerContainer?.exist())
      await this.disconnect()

    this.dockerContainer = new DockerContainer(container, this.docker)
    const containerExist = await this.dockerContainer.get()

    if (!containerExist || !this.dockerContainer?.exist())
      throw new Error(`Can't find the target container "${container}"`)

    if (this.dockerContainer.container?.State.Status !== 'running') {
      if (!this.dockerContainer.container?.Id)
        throw new Error(`Can't find the target container "${container}"`)

      await this.proxyNetwork.removeContainer(container)
      const dockerCli = new DockerCli()
      const execResult = await dockerCli.start(this.dockerContainer.container.Id)

      if (execResult.stderr)
        throw new Error(execResult.stderr)
    }

    await this.proxyNetwork.addContainer(container)
    await this.dockerContainer.get()
    const ip = this.ip

    if (!ip) {
      await this.disconnect()

      throw new Error(
        `An Error appear while getting the target container "${container}" network ip in the network with the name ${this.proxyNetwork.name}`
      )
    }

    // Start audio bridge if audio support was previously installed
    await this.startAudioIfInstalled()

    return super.connect(ip, port)
  }

  async disconnect() {
    await super.disconnect()
    if (!this.dockerContainer) return

    await this.dockerContainer.get()
    if (!this.dockerContainer.container) return

    await this.proxyNetwork.removeContainer(this.dockerContainer.container.Id)

    this.dockerContainer = undefined
  }

  async stop() {
    return this.dockerContainer?.stop()
  }

  getContainerId() {
    if (!this.dockerContainer?.exist()) return

    return this.dockerContainer.container?.Id
  }

  get connected() {
    return this.dockerContainer?.exist() || false
  }

  get ip() {
    return this.dockerContainer?.container?.NetworkSettings.Networks[this.proxyNetwork.name].IPAddress
  }

  get optionLabels() {
    return {
      [TARGET_LABEL_STOP_AFTER_DISCONNECT]: this.options?.stopAfterDisconnect?.toString() || 'false',
    }
  }

  /**
   * If audio support is installed in the container, run the runtime startup
   * script in the background. This is the reliable alternative to init-system
   * service registration (which doesn't work in standard Docker containers).
   * Safe to call multiple times – the script kills any stale PulseAudio before
   * starting a fresh instance.
   */
  private async startAudioIfInstalled() {
    if (!this.dockerContainer) return

    try {
      const audio = await this.hasAudio()

      if (audio.output || audio.input) {
        await this.dockerContainer.execBackground(
          '/usr/local/bin/start-audio-support.sh'
        )
      }
    }
    catch (err) {
      // Non-fatal: audio startup failure should not block the VNC connection
      console.warn('[audio] startAudioIfInstalled failed:', err)
    }
  }

  async hasAudio(): Promise<{ output: boolean, input: boolean }> {
    if (!this.dockerContainer) {
      return { output: false, input: false };
    }

    const [outputFile, inputFile] = await Promise.allSettled([
      this.dockerContainer.fileExists('/etc/.vnc_ext_audio_output'),
      this.dockerContainer.fileExists('/etc/.vnc_ext_audio_input'),
    ])

    const outputFileExists = outputFile.status === 'fulfilled' && outputFile.value === true
    const inputFileExists = inputFile.status === 'fulfilled' && inputFile.value === true
    const outputEnvVarExists = this.dockerContainer.getEnv(this.config.audioOutputEnvVarName) === 'true'
    const inputEnvVarExists = this.dockerContainer.getEnv(this.config.audioInputEnvVarName) === 'true'

    return {
      output: outputFileExists || outputEnvVarExists,
      input: inputFileExists || inputEnvVarExists,
    }
  }
}
