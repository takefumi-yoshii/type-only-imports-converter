import * as ts from 'typescript'
import * as path from 'path'
import { Config } from './types'
import { createConfig, defaultConfig } from './config'
import { removeUndefined } from './arrayFilters'
import { createProgram } from './createProgram'
import { visitSource } from './visitSource'
import { emitFile } from './emitFile'
// ______________________________________________________
//
export function run(config: Config) {
  const printer = ts.createPrinter()
  const srcDir = path.resolve(config.srcDir)
  const distDir = path.resolve(config.distDir)
  const program: ts.Program = createProgram(srcDir, config)
  const checker: ts.TypeChecker = program.getTypeChecker()
  const sources: ts.SourceFile[] = program
    .getRootFileNames()
    .map(fileName => program.getSourceFile(fileName))
    .filter(removeUndefined)
  if (sources.length) {
    sources.map(source => {
      const list = visitSource(source, checker)
      const fileBody = printer.printList(ts.ListFormat.MultiLine, list, source)
      const fileName = `${distDir}${source.fileName.replace(srcDir, '')}`
      emitFile(distDir, fileName, fileBody)
    })
  }
}
if (process.env.NODE_ENV === 'development') {
  run(createConfig(defaultConfig))
}
