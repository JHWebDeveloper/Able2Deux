const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const postcssPresetEnv = require('postcss-preset-env')

const rendererPath = path.resolve('src', 'renderer')

const pages = [ 'index', 'splash', 'update', 'preferences', 'help' ]

module.exports = {
	entry: {
		'react-vendors': ['react', 'react-dom', 'prop-types'],
		...pages.reduce((obj, pg) => {
			obj[pg] = {
				import: path.join(rendererPath, `${pg}.js`),
				dependOn: 'react-vendors'
			}
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
									postcssPresetEnv({ stage: 0 })
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
	resolve: {
		alias: {
			store: path.join(rendererPath, 'store'),
			actions: path.join(rendererPath, 'actions'),
			status: path.join(rendererPath, 'status'),
			utilities: path.join(rendererPath, 'utilities')
		}
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: path.join('assets', 'css', '[name].min.css')
		}),
		...pages.map(pg => new HTMLWebpackPlugin({
			chunks: [pg, 'react-vendors'],
			publicPath: '.',
			filename: `${pg}.html`,
			template: path.join(rendererPath, `${pg}.html`)
		}))
	]
}