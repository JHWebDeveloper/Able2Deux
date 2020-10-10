const path = require('path')
const nodeExternals = require('webpack-node-externals')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const postcssPresetEnv = require('postcss-preset-env')
const cssnano = require('cssnano')

const mainPath = path.join(__dirname, 'src', 'main')

const mainConfig = {
	mode: 'production',
	entry: {
		main: mainPath,
		preload: path.join(mainPath, 'preload', 'preload.js')
	},
	output: {
		path: path.join(__dirname, 'build'),
		filename: '[name].js'
	},
	target: 'electron-main',
	externals: [nodeExternals()],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			}
		]
	},
	plugins: [
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
	],
	node: {
		__dirname: false
	}
}

const rendererPath = path.join(__dirname, 'src', 'renderer')

const pages = [ 'index', 'splash', 'update', 'preferences', 'help' ]

const rendererConfig = {
	mode: 'production',
	entry: {
		...pages.reduce((obj, pg) => {
			obj[pg] = path.join(rendererPath, `${pg}.js`)
			return obj
		}, {}),
		global: path.join(rendererPath, 'css', 'global.css'),
		toastr: path.join(rendererPath, 'css', 'toastr.css')
	},
	output: {
		path: path.join(__dirname, 'build', 'renderer'),
		filename: '[name].bundle.js',
		publicPath: '/'
	},
	target: 'electron-renderer',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			},
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
	],
	node: {
		__dirname: false
	}
}

module.exports = [
	mainConfig,
	rendererConfig
]
