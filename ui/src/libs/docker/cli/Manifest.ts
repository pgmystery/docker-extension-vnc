import { Docker as DockerClient } from '@docker/extension-api-client-types/dist/v1/docker'


interface DockerManifestData {
  mediaType: string
  size: number
  digest: string
  platform: {
    architecture: string
    os: string
  }
}

interface DockerManifestInfo {
  schemaVersion: number
  mediaType: string
  manifests: DockerManifestData[]
}


export default class DockerCliManifest {
  private readonly docker: DockerClient

  constructor(dockerClient: DockerClient) {
    this.docker = dockerClient
  }

  async inspect(manifest: string) {
    const execResult = await this.docker.cli.exec('manifest', [
      'inspect',
      manifest
    ])

    if (execResult.stdout === '')
      return

    return execResult.parseJsonObject() as DockerManifestInfo
  }
}
