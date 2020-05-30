import { remote } from 'electron'

const textElement = 'input[type="text"], input[type="number"]'

const setContextMenu = () => {
	const textEditor = new remote.Menu()
	const dev = process.env.NODE_ENV === 'development'
	let inspectMenu = []
	let ctxEvent = false

	const inspect = !dev ? [] : [
		new remote.MenuItem({
			id: 0,
			label: 'Inspect Element',
			click() {
				remote.getCurrentWindow().inspectElement(ctxEvent.x, ctxEvent.y)
			}
		}),
		new remote.MenuItem({ type: 'separator' })
	]

	const textEditorItems = [
		...inspect,
		new remote.MenuItem({ role: 'cut' }),
		new remote.MenuItem({ role: 'copy' }),
		new remote.MenuItem({ role: 'paste' }),
		new remote.MenuItem({ type: 'separator' }),
		new remote.MenuItem({ role: 'selectAll' })
	]

	if (dev) {
		inspectMenu = new remote.Menu()
		inspectMenu.append(...inspect)
	}

	textEditorItems.forEach(item => textEditor.append(item))

	window.addEventListener('contextmenu', e => {
		e.preventDefault()

		ctxEvent = e

		if (e.target.matches(textElement) && !e.target.disabled) {
			textEditor.popup(remote.getCurrentWindow())
		} else if (dev) {
			inspectMenu.popup(remote.getCurrentWindow())
		}
	})
}

export default setContextMenu
