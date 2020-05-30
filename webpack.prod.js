const path = require('path')
const nodeExternals = require('webpack-node-externals')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const postcssPresetEnv = require('postcss-preset-env')
const cssnano = require('cssnano')
const CopyWebpackPlugin = require('copy-webpack-plugin')

const mainConfig = {
	entry: {
		main: path.join(__dirname, 'src', 'main'),
		preload: path.join(__dirname, 'src', 'main', 'preload', 'preload.js')
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
	node: {
		__dirname: false
	}
}

const rendererConfig = {
	mode: 'production',
	entry: {
		index: path.join(__dirname, 'src', 'renderer'),
		preferences: path.join(__dirname, 'src', 'renderer', 'preferences.js'),
		global: path.join(__dirname, 'src', 'renderer', 'css', 'global.css'),
		toastr: path.join(__dirname, 'src', 'renderer', 'css', 'toastr.css')
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
							ident: 'postcss',
							plugins: [
								postcssPresetEnv({ stage: 0 }),
								cssnano({
									preset: ['default', { calc: false }]
								})
							]
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
		new HTMLWebpackPlugin({
			inject: false,
			filename: 'index.html',
			template: path.join('src', 'renderer', 'index.html')
		}),
		new HTMLWebpackPlugin({
			inject: false,
			filename: 'preferences.html',
			template: path.join('src', 'renderer', 'preferences.html')
		})
	],
	node: {
		__dirname: false
	}
}

module.exports = [
	mainConfig,
	rendererConfig
]
