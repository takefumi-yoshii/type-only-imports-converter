import * as ts from 'typescript'
// ______________________________________________________
//
export type Config = {
  targetDir: string
  tsconfigFileName: string
}
export type ImportSpecifiersMap = { [k: string]: ts.ImportSpecifier[] }
