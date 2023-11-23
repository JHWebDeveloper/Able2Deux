import { promises as fsp } from 'fs'
import path from 'path'

import { PREFERENCES_PATH } from './constants'

const createScratchDisk = () => {
	const _clearFiles = async (dir, id) => {
		let files = await fsp.readdir(dir)
	
		if (!files.length) return Promise.resolve()
	
		if (id) files = files.filter(file => file.startsWith(id))
	
		return Promise.all(files.map(file => fsp.unlink(path.join(dir, file))))
	}
	
	const _clearFilesByAge = async (dir, age) => {
		const files = await fsp.readdir(dir)
		const now = Date.now()
	
		return Promise.all(files.map(file => (async () => {
			const filePath = path.join(dir, file)
			const { ctime } = await fsp.lstat(filePath)
		
			if (now - ctime > age) {
				return fsp.unlink(filePath)
			} else {
				return Promise.resolve()
			}
		})()))
	}

	return {
		imports: {
			path: '',
			clear(id) {
				return _clearFiles(this.path, id)
			},
			clearByAge(age = 144e4) {
				return _clearFilesByAge(this.path, age)
			}
		},
		exports: {
			path: '',
			clear(id) {
				return _clearFiles(this.path, id)
			}
		},
		previews: {
			path: '',
			clear(id) {
				return _clearFiles(this.path, id)
			}
		},
		clearAllByAge() {
			return Promise.all([
				this.imports.clearByAge(),
				this.exports.clear(),
				this.previews.clear()
			])
		},
		clearAll() {
			return Promise.all([
				this.imports.clear(),
				this.exports.clear(),
				this.previews.clear()
			])
		},
		async init() {
			await this.update()
			await this.clearAllByAge() 
		},
		async update() {
			const prefs = JSON.parse(await fsp.readFile(PREFERENCES_PATH))
			const opts = { recursive: true }
		
			this.imports.path = path.join(prefs.scratchDisk.imports, 'able2_imports')
			this.exports.path = path.join(prefs.scratchDisk.exports, 'able2_exports')
			this.previews.path = path.join(prefs.scratchDisk.previews, 'able2_previews')
		
			return Promise.all([
				fsp.mkdir(this.imports.path, opts),
				fsp.mkdir(this.exports.path, opts),
				fsp.mkdir(this.previews.path, opts)
			])
		}
	}
}

export const scratchDisk = createScratchDisk()
