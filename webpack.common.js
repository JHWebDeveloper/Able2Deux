const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const postcssPresetEnv = require('postcss-preset-env')

const RENDERER_PATH = path.resolve('src', 'renderer')
const PAGES = Object.freeze(['index', 'help', 'preferences', 'presets', 'preset_save_as', 'render_queue', 'splash', 'update'])
const ALIAS = Object.freeze(['actions', 'constants', 'css', 'hooks', 'reducer', 'store', 'utilities'])

module.exports = {
	target: 'web',
	entry: {
		common: [
			'react',
			'react-dom',
			'react-router-dom',
			'prop-types',
			'toastr',
			path.join(RENDERER_PATH, 'css', 'global.css'),
			path.join(RENDERER_PATH, 'css', 'toastr.css')
		],
		...PAGES.reduce((obj, page) => {
			obj[page] = {
				import: path.join(RENDERER_PATH, `${page}.js`),
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
		alias: ALIAS.reduce((obj, folder) => {
			obj[folder] = path.join(RENDERER_PATH, folder)
			return obj
		}, {})
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: path.join('assets', 'css', '[name].min.css')
		}),
		...PAGES.map(page => new HTMLWebpackPlugin({
			inject: false,
			filename: `${page}.html`,
			template: path.join(RENDERER_PATH, `${page}.html`)
		})),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.join(RENDERER_PATH, 'font'),
					to: path.join('assets', 'font')
				}
			]
		})
	]
}
