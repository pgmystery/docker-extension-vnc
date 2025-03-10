export interface CliExecOptions {
  [key: string]: CliExecOptionsTypes | CliExecOptionsTypes[] | undefined | null
}

type CliExecOptionsTypes = string | number | boolean
