const path = require('path')
const { spawn } = require('child_process')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const postcssPresetEnv = require('postcss-preset-env')

const rendererPath = path.join(__dirname, 'src', 'renderer')

const pages = [ 'index', 'splash', 'update', 'preferences', 'help' ]

module.exports = {
	mode: 'development',
	entry: {
		...pages.reduce((obj, pg) => {
			obj[pg] = path.join(rendererPath, `${pg}.js`)
			return obj
		}, {}),
		global: path.join(rendererPath, 'css', 'global.css'),
		toastr: path.join(rendererPath, 'css', 'toastr.css')
	},
	output: {
		path: path.join(__dirname, 'build'),
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
	devServer: {
		port: 3000,
		hot: true,
		before() {
			spawn('electron', ['babelRegister.js'], {
				cwd: path.join('src', 'main'),
				shell: true,
				env: process.env,
				stdio: 'inherit'
			}).on('close', () => process.exit(0))
				.on('error', spawnError => console.error(spawnError))
		}
	}
}
