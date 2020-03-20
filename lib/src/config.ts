import { Config } from './types'
//_______________________________________________________
//
export const defaultConfig: Config = {
  srcDir: '../app/src',
  distDir: '../app/dist',
  tsconfigFileName: 'tsconfig.json'
}
export const createConfig = (injects?: Config): Config => ({
  ...defaultConfig,
  ...injects
})
