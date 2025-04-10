import { Docker as DockerClient, ExecResult } from '@docker/extension-api-client-types/dist/v1'
import DockerCliExec from '../cli/Exec'
import { createDockerDesktopClient } from '@docker/extension-api-client'
import { CliExecOptions } from '../../../types/docker/cli'
import { DockerImageInfo } from '../../../types/docker/cli/image'


export default class DockerCliImage extends DockerCliExec {
  constructor(dockerClient?: DockerClient) {
    if (!dockerClient)
      dockerClient = createDockerDesktopClient().docker

    super(dockerClient)
  }

  async inspect(...images: string[]) {
    const execResult = await this.exec('inspect', {
      '--format': '"json"',
    }, ...images)

    return execResult.parseJsonObject() as DockerImageInfo[]
  }

  exec(cmd: string | string[], options?: CliExecOptions, ...args: string[]): Promise<ExecResult> {
    if (typeof cmd === 'string') {
      cmd = [cmd]
    }

    return super.exec(['image', ...cmd], options, ...args)
  }
}
