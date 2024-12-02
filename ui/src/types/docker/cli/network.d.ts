import { RequireOnlyOne } from '../../utils'


export interface DockerNetworkInfo {
  Name: string
  Id: string
  Created: string
  Scope: string
  Driver: string
  EnableIPv6: boolean
  Ipam: {
    Driver: string
    Options: {}
    Config: {
      Subnet: string
      Gateway: string
    }[]
  }
  Internal: boolean
  Attachable: boolean
  Ingress: boolean
  ConfigForm: {
    Network: string
  }
  ConfigOnly: boolean
  Containers: {[key: string]: Omit<DockerNetworkContainer, 'Id'>}
  Options: {}
  Labels: {[key: string]: string}
}

export interface DockerNetworkContainer {
  Id: string
  Name: string
  EndpointID: string
  MacAddress: string
  IPv4Address: string
  IPv6Address: string
}


export interface CliNetworkCreateOptions {
  '--alias'?: string[]
  '--driver-opt'?: string
  '--ip'?: string
  '--ip6'?: string
  '--link-local-ip'?: string[]
}

export interface CliNetworkCreateOptions
  extends RequireOnlyOne<CreateOptionDriverKeys>, RequireOnlyOne<CreateOptionOptKeys>
{
  '--attachable'?: null
  '--config-from'?: string
  '--config-only'?: null
  '--gateway'?: string[]
  '--ingress'?: null
  '--internal'?: null
  '--ip-range'?: string[]
  '--ipam-driver'?: string
  '--ipv6'?: null
  '--label'?: string[]
  '--scope'?: string
  '--subnet'?: string[]
}
interface CreateOptionDriverKeys {
  '--driver': string
  '-d': string
}
interface CreateOptionOptKeys {
  '--opt': string[]
  '-o': string[]
}

export type CliNetworkDisconnectOptions = RequireOnlyOne<OptionForceKeys>

export type CliNetworkRmOptions = RequireOnlyOne<OptionForceKeys>

interface OptionForceKeys {
  '--force': null
  '-f': null
}
