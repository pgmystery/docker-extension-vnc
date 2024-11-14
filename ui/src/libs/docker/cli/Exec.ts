import { Docker as DockerClient } from '@docker/extension-api-client-types/dist/v1/docker'
import { CliExecOptions } from '../../../types/docker/cli'
import { ObjectValueTypes } from '../../../types/utils'


export default class DockerCliExec {
  private client: DockerClient

  constructor(dockerClient: DockerClient) {
    this.client = dockerClient
  }

  exec(cmd: string | string[], options?: CliExecOptions, ...args: string[]) {
    let optionsList: string[] = []

    if (options) {
      for (const [cmdOption, cmdOptionValue] of Object.entries(options)) {
        optionsList.push(cmdOption)

        if (!cmdOptionValue) continue

        if (Array.isArray(cmdOptionValue)) {
          for (const cmdOptionValueItem of cmdOptionValue) {
            const valueString = this.returnValueAsString(cmdOptionValueItem)
            if (valueString) optionsList.push(valueString)
          }

          continue
        }

        const valueString = this.returnValueAsString(cmdOptionValue)
        if (valueString) optionsList.push(valueString)
      }
    }

    if (Array.isArray(cmd)) {
      cmd = cmd.join(' ')
    }

    return this.client.cli.exec(cmd, [...optionsList, ...args])
  }

  private returnValueAsString(value: ObjectValueTypes<CliExecOptions>): string | undefined {
    switch (typeof value) {
      case 'string':
        return value
      case 'number':
        return value.toString()
      case 'boolean':
        return value.toString()
    }
  }
}
