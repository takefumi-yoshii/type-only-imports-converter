import * as ts from 'typescript'
import * as path from 'path'
import { Config } from './types'
import { createConfig, defaultConfig } from './config'
import { removeUndefined } from './arrayFilters'
import { createProgram } from './createProgram'
import { visitSource } from './visitSource'
// ______________________________________________________
//
export function run(config: Config) {
  const srcDir = path.resolve(config.targetDir)
  const program: ts.Program = createProgram(srcDir, config)
  const checker: ts.TypeChecker = program.getTypeChecker()
  const printer = ts.createPrinter()
  const sources: ts.SourceFile[] = program
    .getRootFileNames()
    .map(fileName => program.getSourceFile(fileName))
    .filter(removeUndefined)
  if (sources.length) {
    sources.map(source => {
      const list = visitSource(source, checker)
      const print = printer.printList(ts.ListFormat.MultiLine, list, source)
      console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@')
      console.log(print)
    })
  }
}
if (process.env.NODE_ENV === 'development') {
  run(createConfig(defaultConfig))
}
