import { RequireOnlyOne } from '../../utils'


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
