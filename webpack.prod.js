const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const postcssPresetEnv = require('postcss-preset-env')
const cssnano = require('cssnano')

const mainPath = path.resolve('src', 'main')
const rendererPath = path.resolve('src', 'renderer')
const pages = [ 'index', 'splash', 'update', 'preferences', 'help' ]

const common = {
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			}
		]
	},
	node: {
		__dirname: false
	}
}

const mainConfig = {
	...common,
	entry: mainPath,
	output: {
		path: path.resolve('build'),
		filename: 'main.js'
	},
	target: 'electron-main',
	externals: [nodeExternals()],
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
}

const preloadConfig = {
	...common,
	entry: path.join(mainPath, 'preload', 'preload.js'),
	output: {
		path: path.resolve('build'),
		filename: 'preload.js'
	},
	target: 'electron-preload',
	externals: [nodeExternals()]
}

const rendererConfig = {
	...common,
	entry: {
		...pages.reduce((obj, pg) => {
			obj[pg] = path.join(rendererPath, `${pg}.js`)
			return obj
		}, {}),
		global: path.join(rendererPath, 'css', 'global.css'),
		toastr: path.join(rendererPath, 'css', 'toastr.css')
	},
	output: {
		path: path.resolve('build', 'renderer'),
		filename: '[name].bundle.js',
		publicPath: '/'
	},
	target: 'web',
	module: {
		rules: [
			...common.module.rules,
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
									postcssPresetEnv({ stage: 0 }),
									cssnano({
										preset: ['default', { calc: false }]
									})
								]
							}
						}
					}
				]
			},
			{
				test: /\.(svg|woff2)$/,
				use: ['url-loader']
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: path.join('assets', 'css', '[name].min.css')
		}),
		...pages.map(pg => new HTMLWebpackPlugin({
			inject: false,
			filename: `${pg}.html`,
			template: path.join(rendererPath, `${pg}.html`)
		}))
	]
}

module.exports = [
	mainConfig,
	preloadConfig,
	rendererConfig
]
