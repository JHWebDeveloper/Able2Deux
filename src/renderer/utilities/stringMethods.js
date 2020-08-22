import { zeroize, format12hr } from '.'

export const capitalize = str => `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`

const filterBadChars = (str, p1, p2, p3, p4) => {
	if (p1) return 'and'
	if (p2) return 'prc'
	if (p3) return '2A'
	if (p4) return encodeURIComponent(p4).replace(/%/g, '')
}

export const cleanFileName = fileName => fileName
	.replace(/(&)|(%)|(\*)|(["/:;<>?\\`|ŒœŠšŸ​]|[^!-ż\s])/g, filterBadChars)
	.slice(0, 280)
	.trim()

export const replaceTokens = (filename, i = 0, l = 0) => {
	const d = new Date()

	return filename
		.replace(/\$n/g, zeroize(i + 1, l))
		.replace(/\$d/g, d.toDateString())
		.replace(/\$D/g, d.toLocaleDateString().replace(/\//g, '-'))
		.replace(/\$t/g, format12hr(d))
		.replace(/\$T/g, `${d.getHours()}${d.getMinutes()}`)
}
