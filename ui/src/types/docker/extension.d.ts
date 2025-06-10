export interface ContainerInfo {
  Id: string
  Names: string[]
  Image: string
  ImageID: string
  ImageManifestDescriptor: {
    digest: string
    mediaType: string
    platform: {
      architecture: string
      os: string
    }
    size: number
  }
  Command: string
  Created: number
  Ports: ContainerPort[] | null
  Labels: {[key: string]: string}
  State: string
  Status: string
  HostConfig: {[key: string]: string}
  NetworkSettings: {
    Networks: {[key: string]: ContainerNetworks}
  }
  Mounts: ContainerMounts[]
}

export interface ContainerMounts {
  Destination: string
  Mode: 'rw' | 'ro'
  Propagation: 'shared' | 'slave' | 'private' | 'rshared' | 'rslave' | 'rprivate'
  RW: boolean
  Source: string
  Type: 'bind' | 'volume' | 'tmpfs'
}

export interface ContainerPort {
  IP: string
  PrivatePort: number
  PublicPort: number
  Type: 'tcp' | 'udp'
}

export interface ContainerNetworks {
  IPAMConfig: null
  Links: null
  Aliases: null
  NetworkID: string
  EndpointID: string
  Gateway: string
  IPAddress: string
  IPPrefixLen: number
  IPv6Gateway: string
  GlobalIPv6Address: string
  GlobalIPv6PrefixLen: number
  MacAddress: string
  DriverOpts: null
}

export interface DockerListContainersOptions {
  all?: boolean
  limit?: number
  size?: boolean
  filters: DockerListContainersFilters
}

export interface DockerListContainersFilters {
  ancestor?: string[]
  before?: string[]
  expose?: string[]
  exited?: string[]
  health?: string[]
  id?: string[]
  isolation?: string[]
  is?: string[]
  label?: string[]
  name?: string[]
  network?: string[]
  publish?: string[]
  since?: string[]
  status?: string[]
  volume?: string[]
}

export interface DockerVolumeInspectData {
  CreatedAt: string
  Driver: string
  Labels: {[key: string]: string}
  Mountpoint: string
  Name: string
  Options: {[key: string]: string}
  Scope: string
}

export interface DockerNetworkLsData {
  CreatedAt: string
  Driver: string
  ID: string
  IPv6: string
  Internal: string
  Labels: string
  Name: string
  Scope: string
}

export interface DockerNetworkInfo extends DockerNetworkLsData{
  IPv6: boolean
  Internal: boolean
  Labels: {[key: string]: string}
}

export interface DockerImage {
  Id: string
  ParentId: string
  RepoTags: string[]
  RepoDigests: string[]
  Created: number
  Size: number
  SharedSize: number
  VirtualSize?: number
  Labels: {[key: string]: string}
  Containers: number
}
