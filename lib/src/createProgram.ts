import * as ts from 'typescript'
import { createConfigFileHost } from './createConfigFileHost'
import { Config } from './types'
// ______________________________________________________
//
export function createProgram(searchPath: string, config: Config) {
  const configPath = ts.findConfigFile(
    searchPath,
    ts.sys.fileExists,
    config.tsconfigFileName
  )
  if (!configPath) {
    throw new Error("Could not find 'tsconfig.json'.")
  }
  const parsedCommandLine = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    createConfigFileHost()
  )
  if (!parsedCommandLine) {
    throw new Error('invalid parsedCommandLine.')
  }
  if (parsedCommandLine.errors.length) {
    throw new Error('parsedCommandLine has errors.')
  }
  return ts.createProgram({
    rootNames: parsedCommandLine.fileNames,
    options: parsedCommandLine.options
  })
}
