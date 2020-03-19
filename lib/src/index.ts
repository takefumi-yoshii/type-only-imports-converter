import * as ts from 'typescript'
import * as path from 'path'
import { Config } from './types'
import { createConfig, defaultConfig } from './config'
import { removeUndefined } from './arrayFilters'
import { createProgram } from './createProgram'

// ______________________________________________________
//
const printer = ts.createPrinter()

export function visitSource(checker: ts.TypeChecker, source: ts.SourceFile) {
  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.Identifier:
        if (node.parent.kind === ts.SyntaxKind.ImportSpecifier) {
          const symbol = checker.getSymbolAtLocation(node)
          if (!symbol) return
          const aliasedSymbol = checker.getAliasedSymbol(symbol)
          if (
            !(
              aliasedSymbol.flags === ts.SymbolFlags.Interface ||
              aliasedSymbol.flags === ts.SymbolFlags.TypeAlias
            )
          )
            return
          console.log(
            printer.printList(
              ts.ListFormat.MultiLine,
              ts.createNodeArray([node.parent.parent.parent.parent]),
              ts.createSourceFile('', '', ts.ScriptTarget.ES2015)
            )
          )
        }
        break
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
}
// ______________________________________________________
//
export function run(config: Config) {
  const srcDir = path.resolve(config.targetDir)
  const program: ts.Program = createProgram(srcDir, config)
  const checker: ts.TypeChecker = program.getTypeChecker()
  const sources: ts.SourceFile[] = program
    .getRootFileNames()
    .map(fileName => program.getSourceFile(fileName))
    .filter(removeUndefined)
  if (sources.length) {
    sources.map(source => {
      visitSource(checker, source)
    })
  }
}
if (process.env.NODE_ENV === 'development') {
  run(createConfig(defaultConfig))
}
