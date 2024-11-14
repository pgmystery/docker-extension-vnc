import { Docker as DockerClient } from '@docker/extension-api-client-types/dist/v1/docker'
import { DockerNetworkInfo, DockerNetworkLsData } from '../../../types/docker/extension'
import { ExecResult } from '@docker/extension-api-client-types/dist/v1'


export default class DockerCliNetwork {
  private readonly docker: DockerClient

  constructor(dockerClient: DockerClient) {
    this.docker = dockerClient
  }

  async get(name: string): Promise<DockerNetworkInfo | undefined> {
    const execResult = await this.docker.cli.exec('network', [
      'ls',
      '--format', '"json"',
      '--filter', `"name=${name}"`,
    ])

    if (execResult.stdout === '') return

    return this.parseLsExec(execResult)
  }

  private parseLsExec(execResult: ExecResult): DockerNetworkInfo {
    const networkExecData = execResult.parseJsonObject() as DockerNetworkLsData

    return {
      ...networkExecData,
      IPv6: networkExecData.IPv6 === 'true',
      Internal: networkExecData.Internal === 'true',
      Labels: networkExecData.Labels.split(',').reduce((previousVale, currentValue) => {
        const [labelKey, labelValue] = currentValue.split('=')

        return {
          ...previousVale,
          [labelKey]: labelValue,
        }
      }, {}),
    }
  }
}
