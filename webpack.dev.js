const path = require('path')
const { spawn } = require('child_process')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const postcssPresetEnv = require('postcss-preset-env')

const rendererPath = path.join(__dirname, 'src', 'renderer')

const pages = {
	index: rendererPath,
	splash: path.join(rendererPath, 'splash.js'),
	update: path.join(rendererPath, 'update.js'),
	preferences: path.join(rendererPath, 'preferences.js'),
	help: path.join(rendererPath, 'help.js')
}

module.exports = {
	mode: 'development',
	entry: {
		...pages,
		global: path.join(rendererPath, 'css', 'global.css'),
		toastr: path.join(rendererPath, 'css', 'toastr.css')
	},
	output: {
		path: path.join(__dirname, 'build'),
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
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
							hmr: true
						}
					},
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
		...Object.keys(pages).map(title => new HTMLWebpackPlugin({
			inject: false,
			filename: `${title}.html`,
			template: path.join(rendererPath, `${title}.html`)
		}))
	],
	devServer: {
		contentBase: path.join(__dirname, 'dist'),
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
