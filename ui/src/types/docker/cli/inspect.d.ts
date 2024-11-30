import { RequireOnlyOne } from '../../utils'
import { ContainerInfo } from '../extension'


interface CliInspectOptionFormatKeys {
  '-f': string
  '--format': string
}
type CliInspectOptionFormat = RequireOnlyOne<CliInspectOptionFormatKeys>

interface CliInspectOptionSizeKeys {
  '-s': number
  '--size': number
}
type CliInspectOptionSize = RequireOnlyOne<CliInspectOptionSizeKeys>

interface CliInspectOptionTypeKeys {
  '--type': string
}
type CliInspectOptionType = RequireOnlyOne<CliInspectOptionTypeKeys>

export type CliInspectOptions =
  Partial<CliInspectOptionFormat> |
  Partial<CliInspectOptionSize> |
  Partial<CliInspectOptionType>

export interface ContainerExtended extends Omit<ContainerInfo, 'Names' | 'Labels'> {
  Name: string,
  Config: {
    Hostname: string
    Domainname: string
    User: string
    AttachStdin: boolean
    AttachStdout: boolean
    AttachStderr: boolean
    ExposedPorts: {[key: string]: {}}
    Tty: boolean
    OpenStdin: boolean
    StdinOnce: boolean
    Env: string[]
    Cmd: string[] | string | null
    Image: string
    Volumes: null
    WorkingDir: string
    Entrypoint: string[]
    OnBuild: null
    Labels: {[key: string]: string}
  }
  NetworkSettings: {
    Ports: {
      [key: string]: {
        HostIp: string
        HostPort: string
      }[]
    }
  }
}
