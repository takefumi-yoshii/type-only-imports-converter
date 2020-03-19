import { Config } from './types'
//_______________________________________________________
//
export const defaultConfig: Config = {
  targetDir: '../app',
  tsconfigFileName: 'tsconfig.json'
}
export const createConfig = (injects?: Config): Config => ({
  ...defaultConfig,
  ...injects
})
