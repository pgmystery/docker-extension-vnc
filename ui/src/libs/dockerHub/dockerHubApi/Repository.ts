import { NumberRange } from '../../../types/utils'
import { DockerHubRepositoryTags, RepositoryTag } from '../DockerHubTypes'
import BackendRoute from '../../../api/BackendRoute'
import { createDockerDesktopClient } from '@docker/extension-api-client'


interface GetAllTagsOptions {
  page?: number
  pageSize?: NumberRange<1, 100>
  ordering?: 'last_updated' | '-last_updated' | '-name' | 'name'
  name?: string
}

export default class Repository {
  private readonly api: BackendRoute
  readonly repository: string

  constructor(repository: string) {
    const ddClient = createDockerDesktopClient()
    const backendHttpService = ddClient.extension.vm?.service

    if (!backendHttpService)
      throw new Error('No Docker Desktop Client found...')

    this.api = new BackendRoute(backendHttpService, '/dockerHub')

    if (!repository.includes('/')) {
      repository = `library/${repository}`
    }
    this.repository = repository
  }

  getAllTags(options?: GetAllTagsOptions): Promise<DockerHubRepositoryTags> {
    const queries: {[key: string]: any} = {
      page: 1,
      pageSize: 25,
      ordering: 'last_updated',
      name: '',
      ...options,
    }

    const queryString = Object.keys(queries).length > 0 ? `?${new URLSearchParams(queries)}` : ''

    return this.api.get(`/repository/${this.repository}/tags${queryString}`)
  }

  getTag(tag: string): Promise<RepositoryTag> {
    return this.api.get(`/repository/${this.repository}/tags/${tag}`)
  }
}
