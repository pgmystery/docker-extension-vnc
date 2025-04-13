export interface RepositoryTag {
  content_type: string
  creator: number
  digest: string
  full_size: number
  id: number
  images: {
    architecture: string
    digest: string
    features: string
    last_pulled: string
    last_pushed: string
    os: string
    os_features: string
    os_version: string | null
    size: number
    status: string
    variant: string | null
  }[]
  last_updated: string
  last_updater: number
  last_updater_username: string
  media_type: string
  name: string
  repository: number
  tag_last_pulled: string
  tag_last_pushed: string
  tag_status: string
  v2: string
}

export interface DockerHubRepositoryTags {
  count: number
  next: string | null
  previous: string | null
  results: RepositoryTag[]
}
