const { interop } = window.ABLE2

export const warn = async ({ enabled, message, detail, callback }) => {
	let proceed = true

	if (enabled) {
		proceed = await interop.warning({ message, detail }) === 0
	}

	if (proceed) callback()
}
