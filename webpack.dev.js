const { merge } = require('webpack-merge')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssPresetEnv = require('postcss-preset-env')
const { spawn } = require('child_process')

const common = require('./webpack.common')

module.exports = merge(common, {
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									postcssPresetEnv({ stage: 0 })
								]
							}
						}
					}
				]
			}
		]
	},
	devServer: {
		port: 3000,
		hot: true,
		before() {
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
		}
	}
})
