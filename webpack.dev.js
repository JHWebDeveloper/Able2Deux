const { merge } = require('webpack-merge')
const path = require('path')
const { spawn } = require('child_process')

const common = require('./webpack.common')

process.env.PORT = 3000

module.exports = merge(common, {
	mode: 'development',
	devServer: {
		port: process.env.PORT,
		static: {
			directory: path.resolve('src', 'renderer'),
			watch: true
		},
		hot: true,
		setupMiddlewares(middlewares) {
			spawn('electron', ['babelRegister.js'], {
				cwd: path.resolve('src', 'main'),
				shell: true,
				env: process.env,
				stdio: 'inherit'
			}).on('close', () => {
				process.exit(0)
			}).on('error', spawnError => {
				console.error(spawnError)
			})

			return middlewares
		}
	}
})
