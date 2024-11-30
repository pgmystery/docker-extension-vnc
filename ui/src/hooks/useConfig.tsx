import { useState } from 'react'

export interface Config {
  network: string
  proxyDockerImage: string
  proxyContainerLabelKey: string
  proxyContainerLocalPort: number
  proxyContainerLabelContainerId: string
  proxyContainerLabelTargetIp: string
  proxyContainerLabelTargetPort: string
  proxyContainerLabelConnectionType: string
}

type EnvVarType = string | undefined

export default function useConfig() {
  const [config, setConfig] = useState<Config>(loadConfig())
  const reloadConfig = () => setConfig(loadConfig())

  return [config, reloadConfig]
}

export function loadConfig(): Config {
  const network = import.meta.env.VITE_VNC_CONNECT_DOCKER_NETWORK as EnvVarType
  const proxyDockerImage = import.meta.env.VITE_VNC_PROXY_DOCKER_IMAGE as EnvVarType
  const proxyContainerLabelKey = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_KEY as EnvVarType
  const proxyContainerLocalPort = Number(import.meta.env.VITE_VNC_PROXY_CONTAINER_LOCAL_PORT as EnvVarType)
  const proxyContainerLabelContainerId = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_CONTAINER_ID as EnvVarType
  const proxyContainerLabelTargetIp = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_TARGET_IP as EnvVarType
  const proxyContainerLabelTargetPort = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_TARGET_PORT as EnvVarType
  const proxyContainerLabelConnectionType = import.meta.env.VITE_VNC_PROXY_CONTAINER_LABEL_CONNECTION_TYPE as EnvVarType

  if (!network)
    throw new Error('the envar "VITE_VNC_CONNECT_DOCKER_NETWORK" is not set')

  if (!proxyDockerImage)
    throw new Error('the envar "VITE_VNC_PROXY_DOCKER_IMAGE" is not set')

  if (!proxyContainerLabelKey)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_KEY" is not set')

  if (isNaN(proxyContainerLocalPort) || proxyContainerLocalPort === 0)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LOCAL_PORT" is not set or is not a number')

  if (!proxyContainerLabelContainerId)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_CONTAINER_ID" is not set')

  if (!proxyContainerLabelTargetIp)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_TARGET_IP" is not set')

  if (!proxyContainerLabelTargetPort)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_TARGET_PORT" is not set')

  if (!proxyContainerLabelConnectionType)
    throw new Error('the envar "VITE_VNC_PROXY_CONTAINER_LABEL_CONNECTION_TYPE" is not set')

  return {
    network,
    proxyDockerImage,
    proxyContainerLabelKey,
    proxyContainerLocalPort,
    proxyContainerLabelContainerId,
    proxyContainerLabelTargetIp,
    proxyContainerLabelTargetPort,
    proxyContainerLabelConnectionType,
  }
}
