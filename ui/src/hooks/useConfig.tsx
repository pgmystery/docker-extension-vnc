import { useState } from 'react'

export interface Config {
  network: string
  proxyDockerImage: string
  proxyContainerName: string
  proxyContainerLabelKey: string
  proxyContainerLocalPort: number
  proxyContainerLabelSessionName: string
  proxyContainerLabelContainerId: string
  proxyContainerLabelTargetIp: string
  proxyContainerLabelTargetPort: string
  proxyContainerLabelAudioOutput: string
  proxyContainerLabelAudioInput: string
  proxyContainerLabelConnectionType: string
  proxyContainerPassword: string
  proxyContainerLocalPortAudioTcp: number
  proxyContainerLocalPortAudioUdp: number
  proxyContainerLocalPortAudioSignal: number
  proxyContainerLocalPortAudioInput: number
  audioOutputEnvVarName: string
  audioInputEnvVarName: string
}

type EnvVarType = string | undefined

export default function useConfig(): [Config, ()=>void] {
  const [config, setConfig] = useState<Config>(loadConfig())
  const reloadConfig = () => setConfig(loadConfig())

  return [config, reloadConfig]
}

export function loadConfig(): Config {
  const network = import.meta.env.VITE_VNC_CONNECT_DOCKER_NETWORK as EnvVarType
  const proxyDockerImage = import.meta.env.VITE_VNC_PROXY_DOCKER_IMAGE as EnvVarType
  const proxyContainerName = import.meta.env.VITE_VNC_PROXY_CONTAINER_NAME as EnvVarType
  const proxyContainerLabelKey = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_KEY as EnvVarType
  const proxyContainerLocalPort = Number(import.meta.env.VITE_VNC_PROXY_CONTAINER_LOCAL_PORT as EnvVarType)
  const proxyContainerLabelSessionName = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_SESSION_NAME as EnvVarType
  const proxyContainerLabelContainerId = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_CONTAINER_ID as EnvVarType
  const proxyContainerLabelTargetIp = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_TARGET_IP as EnvVarType
  const proxyContainerLabelTargetPort = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_TARGET_PORT as EnvVarType
  const proxyContainerLabelAudioOutput = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_AUDIO_OUTPUT as EnvVarType
  const proxyContainerLabelAudioInput = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_AUDIO_INPUT as EnvVarType
  const proxyContainerLabelConnectionType = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_CONNECTION_TYPE as EnvVarType
  const proxyContainerPassword = import.meta.env.VITE_VNC_PROXY_CONTAINER_PASSWORD as EnvVarType
  const proxyContainerLocalPortAudioTcp = Number(import.meta.env.VITE_VNC_PROXY_CONTAINER_LOCAL_PORT_AUDIO_TCP as EnvVarType)
  const proxyContainerLocalPortAudioUdp = Number(import.meta.env.VITE_VNC_PROXY_CONTAINER_LOCAL_PORT_AUDIO_UDP as EnvVarType)
  const proxyContainerLocalPortAudioInput = Number(import.meta.env.VITE_VNC_PROXY_CONTAINER_LOCAL_PORT_AUDIO_INPUT as EnvVarType)
  const proxyContainerLocalPortAudioSignal = Number(import.meta.env.VITE_VNC_PROXY_CONTAINER_LOCAL_PORT_AUDIO_SIGNAL as EnvVarType)
  const audioOutputEnvVarName = import.meta.env.VITE_VNC_AUDIO_OUTPUT_ENV_VAR_NAME as EnvVarType
  const audioInputEnvVarName = import.meta.env.VITE_VNC_AUDIO_INPUT_ENV_VAR_NAME as EnvVarType

  if (!network)
    throw new Error('the envar "VITE_VNC_CONNECT_DOCKER_NETWORK" is not set')

  if (!proxyDockerImage)
    throw new Error('the envar "VITE_VNC_PROXY_DOCKER_IMAGE" is not set')

  if (!proxyContainerName)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_NAME" is not set')

  if (!proxyContainerLabelKey)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_KEY" is not set')

  if (isNaN(proxyContainerLocalPort) || proxyContainerLocalPort === 0)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LOCAL_PORT" is not set or is not a number')

  if (!proxyContainerLabelSessionName)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_SESSION_NAME" is not set')

  if (!proxyContainerLabelContainerId)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_CONTAINER_ID" is not set')

  if (!proxyContainerLabelTargetIp)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_TARGET_IP" is not set')

  if (!proxyContainerLabelTargetPort)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_TARGET_PORT" is not set')

  if (!proxyContainerLabelAudioOutput)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_AUDIO_OUTPUT" is not set')

  if (!proxyContainerLabelAudioInput)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_AUDIO_INPUT" is not set')

  if (!proxyContainerLabelConnectionType)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_CONNECTION_TYPE" is not set')

  if (!proxyContainerPassword)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_PASSWORD" is not set')

  if (isNaN(proxyContainerLocalPortAudioTcp) || proxyContainerLocalPortAudioTcp === 0)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LOCAL_PORT_AUDIO_TCP" is not set or is not a number')

  if (isNaN(proxyContainerLocalPortAudioUdp) || proxyContainerLocalPortAudioUdp === 0)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LOCAL_PORT_AUDIO_UDP" is not set or is not a number')

  if (isNaN(proxyContainerLocalPortAudioInput) || proxyContainerLocalPortAudioInput === 0)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LOCAL_PORT_AUDIO_INPUT" is not set or is not a number')

  if (isNaN(proxyContainerLocalPortAudioSignal) || proxyContainerLocalPortAudioSignal === 0)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LOCAL_PORT_AUDIO_SIGNAL" is not set or is not a number')

  if (!audioOutputEnvVarName)
    throw new Error('the envar "VITE_VNC_AUDIO_OUTPUT_ENV_VAR_NAME" is not set')

  if (!audioInputEnvVarName)
    throw new Error('the envar "VITE_VNC_AUDIO_INPUT_ENV_VAR_NAME" is not set')

  return {
    network,
    proxyDockerImage,
    proxyContainerName,
    proxyContainerLabelKey,
    proxyContainerLocalPort,
    proxyContainerLabelSessionName,
    proxyContainerLabelContainerId,
    proxyContainerLabelTargetIp,
    proxyContainerLabelTargetPort,
    proxyContainerLabelAudioOutput,
    proxyContainerLabelAudioInput,
    proxyContainerLabelConnectionType,
    proxyContainerPassword,
    proxyContainerLocalPortAudioInput,
    proxyContainerLocalPortAudioTcp,
    proxyContainerLocalPortAudioUdp,
    proxyContainerLocalPortAudioSignal,
    audioOutputEnvVarName,
    audioInputEnvVarName,
  }
}
