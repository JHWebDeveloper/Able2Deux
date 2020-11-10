const { merge } = require('webpack-merge')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const { EnvironmentPlugin } = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const commonRenderer = require('./webpack.common')

const mainPath = path.resolve('src', 'main')

const commonMain = {
	mode: 'production',
	module: {
		rules: [
			commonRenderer.module.rules[0] //.js
		]
	},
	externals: [nodeExternals()],
	node: {
		__dirname: false
	}
}

const mainConfig = merge(commonMain, {
	target: 'electron-main',
	entry: mainPath,
	output: {
		path: path.resolve('build'),
		filename: 'main.js'
	},
	plugins: [
		new EnvironmentPlugin({
			DEVTOOLS: !!process.env.DEVTOOLS
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.join(mainPath, 'backgrounds'),
					to: path.join('assets', 'backgrounds')
				}
			]
		})
	]
})

const preloadConfig = merge(commonMain, {
	target: 'electron-preload',
	entry: path.join(mainPath, 'preload', 'preload.js'),
	output: {
		path: path.resolve('build'),
		filename: 'preload.js'
	}
})

const rendererConfig = merge(commonRenderer, {
	mode: 'production',
	plugins: [
		new CssMinimizerPlugin({
			minimizerOptions: {
				preset: ['default', { calc: false }]
			}
		})
	]
})

module.exports = [
	mainConfig,
	preloadConfig,
	rendererConfig
]
