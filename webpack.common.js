const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const postcssPresetEnv = require('postcss-preset-env')
const postcssPseudoIs = require('postcss-pseudo-is')

const rendererPath = path.resolve('src', 'renderer')
const pages = ['index', 'splash', 'update', 'preferences', 'help']
const alias = ['actions', 'css', 'hooks', 'reducer', 'status', 'store', 'utilities']

module.exports = {
	target: 'web',
	entry: {
		common: [
			'react',
			'react-dom',
			'react-router-dom',
			'prop-types',
			'toastr',
			path.join(rendererPath, 'css', 'global.css'),
			path.join(rendererPath, 'css', 'toastr.css')
		],
		...pages.reduce((obj, page) => {
			obj[page] = {
				import: path.join(rendererPath, `${page}.js`),
				dependOn: 'common'
			}
			return obj
		}, {})
	},
	output: {
		path: path.resolve('build', 'renderer'),
		filename: '[name].bundle.js',
		publicPath: '/'
	},
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
					{
						loader: 'css-loader',
						options: {
							url: false
						}
					},
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									// postcssPseudoIs(),
									postcssPresetEnv({ stage: 0 })
								]
							}
						}
					}
				]
			}
		]
	},
	resolve: {
		alias: alias.reduce((obj, folder) => {
			obj[folder] = path.join(rendererPath, folder)
			return obj
		}, {})
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: path.join('assets', 'css', '[name].min.css')
		}),
		...pages.map(page => new HTMLWebpackPlugin({
			inject: false,
			filename: `${page}.html`,
			template: path.join(rendererPath, `${page}.html`)
		})),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.join(rendererPath, 'font'),
					to: path.join('assets', 'font')
				}
			]
		})
	]
}
