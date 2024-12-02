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
  Id: string
  Created: string
  Path: string
  Args: string[]
  State: {
    Status: 'created' | 'restarting' | 'running' | 'removing' | 'paused' | 'exited' | 'dead'
    Running: boolean
    Paused: boolean
    Restarting: boolean
    OOMKilled: boolean
    Dead: boolean
    Pid: number
    ExitCode: number
    Error: string
    StartedAt: string
    FinishedAt: string
  }
  Image: string
  ResolvConfPath: string
  HostnamePath: string
  HostsPath: string
  LogPath: string
  Name: string
  RestartCount: string
  Driver: string
  Platform: string
  MountLabel: string
  ProcessLabel: string
  AppArmorProfile: string
  ExecIDs: null
  HostConfig: {
    Binds: null
    ContainerIDFile: string
    LogConfig: {
      Type: string
      config: {}
    }
  }
  NetworkMode: string
  PortBindings: {}
  RestartPolicy: {
    Name: string
    MaximumRetryCount: number
  }
  AutoRemove: boolean
  VolumeDriver: string
  VolumesFrom: null
  ConsoleSize: [number, number]
  CapAdd: null
  CapDrop: null
  CgroupnsMode: string
  Dns: any[]
  DnsOptions: any[]
  DnsSearch: any[]
  ExtraHosts: null
  GroupAdd: null
  IpcMode: string
  Cgroup: string
  Links: null
  OomScoreAdj: number
  PidMode: string
  Privileged: boolean
  PublishAllPorts: boolean
  ReadonlyRootfs: boolean
  SecurityOpt: null
  UTSMode: string
  UsernsMode: string
  ShmSize: number
  Runtime: string
  Isolation: string
  CpuShares: number
  Memory: number
  NanoCpus: number
  CgroupParent: string
  BlkioWeight: number
  BlkioWeightDevice: any[]
  BlkioDeviceReadBps: any[]
  BlkioDeviceWriteBps: any[]
  BlkioDeviceReadIOps: any[]
  BlkioDeviceWriteIOps: any[]
  CpuPeriod: number
  CpuQuota: number
  CpuRealtimePeriod: number
  CpuRealtimeRuntime: number
  CpusetCpus: string
  CpusetMems: string
  Devices: any[]
  DeviceCgroupRules: null
  DeviceRequests: null
  MemoryReservation: number
  MemorySwap: number
  MemorySwappiness: null
  OomKillDisable: boolean
  PidsLimit: null
  Ulimits: any[]
  CpuCount: number
  CpuPercent: number
  IOMaximumIOps: number
  IOMaximumBandwidth: number
  MaskedPaths: string[]
  ReadonlyPaths: string[]
  GraphDriver: {
    Data: {
      LowerDir: string
      MergedDir: string
      UpperDir: string
      WorkDir: string
    }
    Name: string
  }
  Mounts: any[]
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
    Bridge: string
    SandboxID: string
    SandboxKey: string
    Ports: {
      [key: string]: {
        HostIp: string
        HostPort: string
      }[] | null
    }
    HairpinMode: boolean
    LinkLocalIPv6Address: string
    LinkLocalIPv6PrefixLen: number
    SecondaryIPAddresses: null
    SecondaryIPv6Addresses: null
    EndpointID: string
    Gateway: string
    GlobalIPv6Address: string
    GlobalIPv6PrefixLen: number
    IPAddress: string
    IPPrefixLen: number
    IPv6Gateway: string
    MacAddress: string
    Networks: {[key: string]: {
        IPAMConfig: null
        Links: null
        Aliases: null
        MacAddress: string
        DriverOpts: null
        NetworkID: string
        EndpointID: string
        Gateway: string
        IPAddress: string
        IPPrefixLen: number
        IPv6Gateway: string
        GlobalIPv6Address: string
        GlobalIPv6PrefixLen: number
        DNSNames: string[] | null
      }}
  }
  HairpinMode: boolean
  LinkLocalIPv6Address: string
  LinkLocalIPv6PrefixLen: number
  SecondaryIPAddresses: null
  SecondaryIPv6Addresses: null
  EndpointID: string
  Gateway: string
  GlobalIPv6Address: string
  GlobalIPv6PrefixLen: number
  IPAddress: string
  IPPrefixLen: number
  IPv6Gateway: string
  MacAddress: string
}
