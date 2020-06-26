import toCSS from 'to-css'

const getPCStyles = () => toCSS({
	'::-webkit-scrollbar': {
		width: '10px',
		height: '10px'
	},
	'::-webkit-scrollbar-thumb': {
		'background-color': '#777',
		'border-radius': '5px'
	},
	'::-webkit-scrollbar-button': {
		display: 'none'
	}
})

const insertPCStyles = win => {
	win.webContents.on('did-finish-load', () => {
		win.webContents.insertCSS(getPCStyles(), {
			cssOrigin: 'user'
		})
	})
}

export default insertPCStyles
