import * as ts from 'typescript'
import { getLastChild } from './nodeHelpers'
// ______________________________________________________
//
export const getSeparatedImportSpecifiers = (
  node: ts.Node,
  checker: ts.TypeChecker
) => {
  // 型宣言・非型宣言の格納M配列を取得
  const [
    typeImportSpecifiers,
    nonTypeImportSpecifiers
  ]: ts.ImportSpecifier[][] = [[], []]
  function visit(node: ts.Node) {
    switch (node.kind) {
      case ts.SyntaxKind.ImportSpecifier:
        if (!ts.isImportSpecifier(node)) return
        // import している
        const symbol = checker.getSymbolAtLocation(getLastChild(node))
        // 非シンボルは除外
        if (!symbol) {
          nonTypeImportSpecifiers.push(node)
          return
        }
        // 非参照シンボルは除外
        if (symbol.flags !== ts.SymbolFlags.Alias) {
          nonTypeImportSpecifiers.push(node)
          return
        }
        // 参照適用シンボルを取得
        const aliasedSymbol = checker.getAliasedSymbol(symbol)
        // 参照適用シンボルが型宣言かのフラグ
        const flag =
          aliasedSymbol.flags === ts.SymbolFlags.Interface ||
          aliasedSymbol.flags === ts.SymbolFlags.TypeAlias
        // 非型宣言参照適用シンボルの場合
        if (!flag) {
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
