import { RequireOnlyOne } from '../../utils'
import { Container } from '../extension'


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

export interface ContainerExtended extends Container {
  NetworkSettings: {
    Ports: {
      [key: string]: {
        HostIp: string
        HostPort: string
      }[]
    }
  }
}
// ddClient.docker.cli.exec('inspect', ['1cc1bec63c70e6c66644b81bc5f4a5804ed94411c63193dc16600dc004f09e3a'])
