import * as ts from 'typescript'
import { ImportSpecifiersMap } from './types'
import { isDefaultImportClause, getImportPathIdentifier } from './nodeHelpers'
import { getSeparatedImportSpecifiers } from './getSeparatedImportSpecifiers'
import { getImportDeclarationsFromImportSpecifiersMap } from './getImportDeclarationsFromImportSpecifiersMap'
// ______________________________________________________
//
export function visitSource(
  source: ts.SourceFile,
  checker: ts.TypeChecker
): ts.NodeArray<ts.Node> {
  const indifferenceElements: ts.Node[] = []
  const typeImportSpecifiersMap: ImportSpecifiersMap = {}
  const nonTypeImportSpecifiersMap: ImportSpecifiersMap = {}
  source.forEachChild(node => {
    // ImportDeclaration 以外は除外
    if (!ts.isImportDeclaration(node)) {
      indifferenceElements.push(node)
      return
    }
    // 型宣言・非型宣言の格納M配列Mapを作成、同様の import path の場合マージする
    const pathIdentifier = getImportPathIdentifier(node)
    if (!typeImportSpecifiersMap[pathIdentifier.text]) {
      typeImportSpecifiersMap[pathIdentifier.text] = []
    }
    if (!nonTypeImportSpecifiersMap[pathIdentifier.text]) {
      nonTypeImportSpecifiersMap[pathIdentifier.text] = []
    }
    // ImportDeclaration の場合処理続行
    function visit(node: ts.Node) {
      switch (node.kind) {
        case ts.SyntaxKind.ImportClause:
          if (!ts.isImportClause(node)) return
          // DefaultImport の場合
          if (isDefaultImportClause(node)) {
            indifferenceElements.push(
              ts.createImportDeclaration(
                undefined,
                undefined,
                node,
                pathIdentifier
              )
            )
            break
          }
          // NamedImports の場合、型宣言・非型宣言の格納配列を取得
          const [
            typeImportSpecifiers,
            nonTypeImportSpecifiers
          ] = getSeparatedImportSpecifiers(node, checker)
          typeImportSpecifiersMap[pathIdentifier.text].push(
            ...typeImportSpecifiers
          )
          nonTypeImportSpecifiersMap[pathIdentifier.text].push(
            ...nonTypeImportSpecifiers
          )
      }
      ts.forEachChild(node, visit)
    }
    visit(node)
  })

  return ts.createNodeArray([
    ...getImportDeclarationsFromImportSpecifiersMap(
      nonTypeImportSpecifiersMap,
      false
    ),
    ...getImportDeclarationsFromImportSpecifiersMap(
      typeImportSpecifiersMap,
      true
    ),
    ...indifferenceElements
  ])
}
