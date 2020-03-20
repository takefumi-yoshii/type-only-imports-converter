import * as ts from 'typescript'
// ______________________________________________________
//
export type Config = {
  srcDir: string
  distDir: string
  tsconfigFileName: string
}
export type ImportSpecifiersMap = { [k: string]: ts.ImportSpecifier[] }
