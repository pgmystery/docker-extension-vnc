import { Docker as DockerClient } from '@docker/extension-api-client-types/dist/v1/docker'
import { CliExecOptions } from '../../../types/docker/cli'
import { ObjectValueTypes } from '../../../types/utils'
import { RawExecResult } from '@docker/extension-api-client-types/dist/v1'


export function isRawExecResult(rawExecResult: RawExecResult): rawExecResult is RawExecResult {
  return (rawExecResult as RawExecResult).stderr !== undefined
}


export default class DockerCliExec {
  protected client: DockerClient

  constructor(dockerClient: DockerClient) {
    this.client = dockerClient
  }

  exec(cmd: string | string[], options?: CliExecOptions, ...args: string[]) {
    let optionsList: string[] = []

    if (options) {
      for (const [cmdOption, cmdOptionValue] of Object.entries(options)) {
        if (!cmdOptionValue) {
          optionsList.push(cmdOption)

          continue
        }

        if (Array.isArray(cmdOptionValue)) {
          for (const cmdOptionValueItem of cmdOptionValue) {
            const valueString = this.returnValueAsString(cmdOptionValueItem)
            if (valueString) {
              optionsList.push(cmdOption)
              optionsList.push(valueString)
            }
          }

          continue
        }

        optionsList.push(cmdOption)

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
