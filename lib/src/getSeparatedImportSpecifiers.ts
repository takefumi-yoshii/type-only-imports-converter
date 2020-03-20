import * as ts from 'typescript'
import { getLastChild } from './nodeHelpers'
// ______________________________________________________
//
function isTypeSymbol(symbol: ts.Symbol) {
  return (
    symbol.flags === ts.SymbolFlags.Interface ||
    symbol.flags === ts.SymbolFlags.TypeAlias
  )
}
// ______________________________________________________
//
export const getSeparatedImportSpecifiers = (
  node: ts.Node,
  checker: ts.TypeChecker
) => {
  const [
    typeImportSpecifiers,
    nonTypeImportSpecifiers
  ]: ts.ImportSpecifier[][] = [[], []]
  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ImportSpecifier:
        if (!ts.isImportSpecifier(node)) return
        const symbol = checker.getSymbolAtLocation(getLastChild(node))
        if (!symbol) {
          nonTypeImportSpecifiers.push(node)
          return
        }
        if (symbol.flags !== ts.SymbolFlags.Alias) {
          nonTypeImportSpecifiers.push(node)
          return
        }
        // 参照適用シンボルを取得
        const aliasedSymbol = checker.getAliasedSymbol(symbol)
        if (!isTypeSymbol(aliasedSymbol)) {
          nonTypeImportSpecifiers.push(node)
          return
        }
        typeImportSpecifiers.push(node)
    }
    ts.forEachChild(node, visit)
  }
  visit(node)
  return [typeImportSpecifiers, nonTypeImportSpecifiers]
}
