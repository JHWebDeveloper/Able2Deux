const { merge } = require('webpack-merge')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const { EnvironmentPlugin } = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')

const MAIN_PATH = path.resolve('src', 'main')

const commonRenderer = require('./webpack.common')

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
	entry: MAIN_PATH,
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
					from: path.join(MAIN_PATH, 'backgrounds'),
					to: path.join('assets', 'backgrounds')
				},
				{
					from: path.resolve('src', 'build_assets'),
					to: '.'
				}
			]
		})
	]
})

const preloadConfig = merge(commonMain, {
	target: 'electron-preload',
	entry: path.join(MAIN_PATH, 'preload', 'preload.js'),
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
