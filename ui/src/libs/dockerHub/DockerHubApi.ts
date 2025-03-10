import Repository from './dockerHubApi/Repository'


export default class DockerHubApi {
  repository(repository: string) {
    return new Repository(repository)
  }
}
