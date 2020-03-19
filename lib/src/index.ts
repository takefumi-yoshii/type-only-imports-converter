import * as ts from 'typescript'
import * as path from 'path'
import { Config } from './types'
import { createConfig, defaultConfig } from './config'
import { removeUndefined } from './arrayFilters'
import { createProgram } from './createProgram'
// ______________________________________________________
//
const printer = ts.createPrinter()
// ______________________________________________________
//
const extractTypeDeclarationChild = (
  checker: ts.TypeChecker,
  node: ts.Node
): ts.Node[] =>
  node
    .getChildren()
    .map(child => {
      const symbol = checker.getSymbolAtLocation(child)
      if (!symbol) return
      if (symbol.flags !== ts.SymbolFlags.Alias) return
      const aliasedSymbol = checker.getAliasedSymbol(symbol)
      const flag =
        aliasedSymbol.flags === ts.SymbolFlags.Interface ||
        aliasedSymbol.flags === ts.SymbolFlags.TypeAlias
      if (!flag) return
      return child
    })
    .filter(removeUndefined)
// ______________________________________________________
//
const mapTypeDeclarationImportSpecifiers = (
  checker: ts.TypeChecker,
  node: ts.Node
): ts.ImportSpecifier[] =>
  extractTypeDeclarationChild(checker, node).map(
    child => child.parent as ts.ImportSpecifier
  )
// ______________________________________________________
//
const getImportDeclarationImportPathIdentifier = (
  node: ts.ImportDeclaration
): ts.Identifier => {
  const pathStribngLiteralNode = node.getChildAt(3)
  const text = pathStribngLiteralNode.getText()
  return ts.createIdentifier(text)
}
// ______________________________________________________
//
const createImportDeclaration = (
  importClause: ts.ImportClause,
  moduleSpecifier: ts.Expression
) =>
  ts.createImportDeclaration(
    undefined,
    undefined,
    importClause,
    moduleSpecifier
  )
// ______________________________________________________
//

// ______________________________________________________
//
export function visitSource(checker: ts.TypeChecker, source: ts.SourceFile) {
  const buf: ts.Node[] = []
  source.forEachChild(node => {
    // ImportDeclaration 以外は除外
    if (!ts.isImportDeclaration(node)) {
      buf.push(node)
      return
    }
    // TypeOnlyImport の場合は除外
    if (ts.isTypeOnlyImportOrExportDeclaration(node.getChildAt(1))) {
      buf.push(node)
      return
    }
    // リファクタ対象の ImportDeclaration
    const pathStribngLiteralNode = getImportDeclarationImportPathIdentifier(
      node
    )
    const buff: { [k: string]: ts.ImportDeclaration[] } = {}

    // ImportDeclarationの場合処理続行
    function visit(node: ts.Node) {
      switch (node.kind) {
        case ts.SyntaxKind.ImportSpecifier:
          const importSpecifiers = mapTypeDeclarationImportSpecifiers(
            checker,
            node
          )
          if (!!importSpecifiers.length) {
            const importClause = ts.createImportClause(
              undefined,
              ts.createNamedImports(importSpecifiers),
              true
            )
            if (!buff[pathStribngLiteralNode.text]) {
              buff[pathStribngLiteralNode.text] = []
            }
            const importDeclaration = createImportDeclaration(
              importClause,
              pathStribngLiteralNode
            )
            buff[pathStribngLiteralNode.text].push(importDeclaration)
          } else {
            buf.push(node)
          }
          break
      }
      ts.forEachChild(node, visit)
    }
    visit(node)

    Object.keys(buff).forEach(key => {
      buf.push(...(buff[key] as any))
    })
  })
  console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@')
  console.log(
    printer.printList(
      ts.ListFormat.MultiLine,
      ts.createNodeArray(buf),
      ts.createSourceFile('', '', ts.ScriptTarget.ES2015)
    )
  )
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
