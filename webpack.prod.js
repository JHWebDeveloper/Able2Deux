const webpack = require('webpack')
const { merge } = require('webpack-merge')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const RemoveFilesPlugin = require('remove-files-webpack-plugin')

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
	entry: mainPath,
	output: {
		path: path.resolve('build'),
		filename: 'main.js'
	},
	target: 'electron-main',
	plugins: [
		new webpack.EnvironmentPlugin({
			DEVTOOLS: !!process.env.DEVTOOLS
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.join(mainPath, 'backgrounds'),
					to: path.join('assets', 'backgrounds')
				},
				{
					from: path.join(mainPath, 'icons'),
					to: path.join('assets', 'icons')
				}
			]
		})
	]
})

const preloadConfig = merge(commonMain, {
	entry: path.join(mainPath, 'preload', 'preload.js'),
	output: {
		path: path.resolve('build'),
		filename: 'preload.js'
	},
	target: 'electron-preload'
})

const rendererConfig = merge(commonRenderer, {
	mode: 'production',
	plugins: [
		new CssMinimizerPlugin({
			minimizerOptions: {
				preset: ['default', { calc: false }]
			}
		}),
		new RemoveFilesPlugin({
			after: {
				root: path.resolve('build', 'renderer'),
				include: ['global.bundle.js', 'toastr.bundle.js']
			}
		})
	]
})

module.exports = [
	mainConfig,
	preloadConfig,
	rendererConfig
]
