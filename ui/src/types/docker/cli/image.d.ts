export interface DockerImageInfo {
  Id: string;
  RepoTags: string[];
  RepoDigests: string[];
  Comment: string;
  Created: string; // ISO timestamp
  Config: ImageConfig;
  Architecture: string;
  Os: string;
  Size: number;
  RootFS: RootFS;
  Metadata: Metadata;
  Descriptor: Descriptor;
  Identity: Identity;
}

interface ImageConfig {
  ExposedPorts: Record<string, Record<string, never>>;
  Env: string[];
  Entrypoint: string[];
  WorkingDir: string;
  Labels: Record<string, string>;
}

interface RootFS {
  Type: string;
  Layers: string[];
}

interface Metadata {
  LastTagTime: string; // ISO timestamp
}

interface Descriptor {
  mediaType: string;
  digest: string;
  size: number;
}

interface Identity {
  Pull?: PullIdentity[];
  Build?: BuildInfo[];
}

interface PullIdentity {
  Repository: string;
}

interface BuildInfo {
  Ref: string;
  CreatedAt: string;
}
