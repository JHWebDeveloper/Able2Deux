const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const postcssPresetEnv = require('postcss-preset-env')

const rendererPath = path.resolve('src', 'renderer')

const pages = ['index', 'splash', 'update', 'preferences', 'help']

module.exports = {
	entry: {
		...pages.reduce((obj, page) => {
			obj[page] = path.join(rendererPath, `${page}.js`)
			return obj
		}, {}),
		'react-vendors': ['react', 'react-dom', 'prop-types'],
		global: path.join(rendererPath, 'css', 'global.css'),
		toastr: ['toastr', path.join(rendererPath, 'css', 'toastr.css')]
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
		...pages.map(page => new HTMLWebpackPlugin({
			inject: false,
			filename: `${page}.html`,
			template: path.join(rendererPath, `${page}.html`)
		}))
	]
}
