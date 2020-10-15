import path from 'path'
import { fixPathForAsarUnpack } from 'electron-util'

export const assetsPath = fixPathForAsarUnpack(process.env.NODE_ENV === 'development'
	? path.join(__dirname, '..', '..', 'backgrounds')
	: path.join(__dirname, 'assets', 'backgrounds'))
