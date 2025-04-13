export interface DockerImageInfo {
  id: string
  RepoTags: string[]
  RepoDigests: string[]
  Parent: string
  Comment: string
  Created: string
  DockerVersion: string
  Author: string
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
    Cmd: null
    Image: string
    Volumes: null
    WorkingDir: string
    Entrypoint: string[]
    OnBuild: null
    Labels: {[key: string]: string}
  }
  Architecture: string
  Os: string[]
  Size: number
  GraphDriver: {
    Data: {
      LowerDir: string
      MergedDIr: string
      UpperDir: string
      WorkDir: string
    }
    Name: string
  }
  RootFS: {
    Type: string
    Layers: string[]
  }
  Metadata: {
    LastTagTime: string
  }
}
