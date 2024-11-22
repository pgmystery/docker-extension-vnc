import { ExecResult } from '@docker/extension-api-client-types/dist/v1'


export default class MultiExecResult implements ExecResult {
  private execResults: ExecResult[]

  constructor(execResult?: ExecResult) {
    this.execResults = []

    if (execResult)
      this.addExecResult(execResult)
  }

  addExecResult(execResult: ExecResult) {
    this.execResults.push(execResult)
  }

  lines(): string[] {
    return this.execResults.reduce((previousValue: string[], currentValue: ExecResult) => ([
      ...previousValue,
      ...currentValue.lines(),
    ]), [] as string[])
  }

  parseJsonLines(): any[] {
    return this.execResults.reduce((previousValue: any[], currentValue: ExecResult) => ([
      ...previousValue,
      ...currentValue.parseJsonLines(),
    ]), [] as any[])
  }

  parseJsonObject(): any {
    return this.execResults.reduce((previousValue: any[], currentValue: ExecResult) => ([
      ...previousValue,
      ...currentValue.parseJsonObject(),
    ]), [] as any[])
  }

  get stdout() {
    return this.execResults.reduce((previousValue: string, currentValue: ExecResult) => {
      if (previousValue === '') {
        return currentValue.stdout
      }

      return previousValue + "\n" + currentValue.stdout
    }, '')
  }

  get stderr() {
    return this.execResults.reduce((previousValue: string, currentValue: ExecResult) => {
      if (previousValue === '') {
        return currentValue.stderr
      }

      return previousValue + "\n" + currentValue.stderr
    }, '')
  }
}
