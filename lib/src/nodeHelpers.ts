import * as ts from 'typescript'
// ______________________________________________________
//
export const getLastChild = (node: ts.Node) => {
  return node.getChildAt(node.getChildCount() - 1)
}
export const isDefaultImportClause = (node: ts.ImportClause) => {
  const child = node.getChildAt(0)
  return !(
    child.kind === ts.SyntaxKind.NamedImports ||
    child.kind === ts.SyntaxKind.TypeKeyword
  )
}
export const getImportPathIdentifier = (
  node: ts.ImportDeclaration
): ts.Identifier => {
  const pathIdentifier = node.getChildAt(3)
  const text = pathIdentifier.getText()
  return ts.createIdentifier(text)
}
