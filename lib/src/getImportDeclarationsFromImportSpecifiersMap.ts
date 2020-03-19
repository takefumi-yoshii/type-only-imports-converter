import * as ts from 'typescript'
import { ImportSpecifiersMap } from './types'
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
export const getImportDeclarationsFromImportSpecifiersMap = (
  importSpecifiersMap: ImportSpecifiersMap,
  isTypeOnly: boolean
) => {
  const importDeclarations: ts.ImportDeclaration[] = []
  Object.keys(importSpecifiersMap).forEach(key => {
    const elements: ts.ImportSpecifier[] = importSpecifiersMap[key]
    if (!elements.length) return
    importDeclarations.push(
      createImportDeclaration(
        ts.createImportClause(
          undefined,
          ts.createNamedImports(elements),
          isTypeOnly
        ),
        ts.createIdentifier(key)
      )
    )
  })
  return importDeclarations
}
