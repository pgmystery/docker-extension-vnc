export interface RepositoryTag {
  id: number
  images: {
    architecture: string
    features: string
    variant: string
    digest: string
    layers: {
      digest: string
      size: number
      instruction: string
    }[]
    os: string
    os_features: string
    os_version: string
    size: number
    status: string
    last_pulled: string
    last_pushed: string
  }[]
  creator: number
  last_updated: string
  last_updater: number
  last_updater_username: string
  name: string
  repository: number
  full_size: number
  v2: string
  status: string
  tag_last_pulled: string
  tag_last_pushed: string
}

export interface DockerHubRepositoryTags {
  count: number
  next: string | null
  previous: string | null
  results: RepositoryTag[]
}
