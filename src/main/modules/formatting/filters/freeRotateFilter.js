const degToRad = deg => deg * Math.PI / 180

const calcRotatedDimension = (w, h, trig1, trig2) => w * trig1 + h * trig2

const calcRotatedBoundingBox = (w, h, rad, dimension) => {
	const sin = Math.abs(Math.sin(rad))
	const cos = Math.abs(Math.cos(rad))

  switch (dimension) {
    case 'w':
      return calcRotatedDimension(w, h, cos, sin)
    case 'h':
      return calcRotatedDimension(w, h, sin, cos)
    default:
      return [
        calcRotatedDimension(w, h, cos, sin),
        calcRotatedDimension(w, h, sin, cos)
      ]
  }
}

const shiftBounds = (rotDim, scaledDim, rad, prc, inverter) => {
  const dist = (scaledDim - rotDim) / 2 * prc * inverter / 100
  const sin = Math.abs(Math.sin(rad))
  const cos = Math.abs(Math.cos(rad))

  return [ dist * sin * inverter, dist * cos ]
}

const shouldInvert = deg => deg <= -90 || deg > 0 && deg <= 90

const cmdChunks = [
  ',scale=iw*',
  ',rotate=\'',
  ':ow=hypot(iw,ih):oh=ow:c=none\''
]

export const freeRotateFilter = (rotation, w, h) => {
  const { center, angle, freeRotateMode } = rotation
  const rad = degToRad(angle)

  if (freeRotateMode !== 'cover') return `${cmdChunks[1]}${rad}${cmdChunks[2]}`

  const isTall = w < h
  const isNotCentered = center !== 0

  let scale = 1
  let shiftX = 0
  let shiftY = 0

  if (isTall && isNotCentered) {
    const [ rotW, rotH ] = calcRotatedBoundingBox(w, h, rad)

    scale = rotW / w

    const inverter = shouldInvert(angle) ? -1 : 1
    const shift = shiftBounds(rotH, h * scale, rad, center, inverter)

    shiftX = shift[0]
    shiftY = shift[1]
  } else if (isTall) {
    scale = calcRotatedBoundingBox(w, h, rad, 'w') / w
  } else if (isNotCentered) {
    const [ rotW, rotH ] = calcRotatedBoundingBox(w, h, rad)
    
    scale = rotH / h

    const inverter = shouldInvert(angle) ? 1 : -1
    const shift = shiftBounds(rotW, w * scale, rad, center, inverter)

    shiftX = shift[1]
    shiftY = shift[0]
  } else {
    scale = calcRotatedBoundingBox(w, h, rad, 'h') / h
  }

  return `${cmdChunks[0]}${scale}:ih*${scale}${cmdChunks[1]}${rad}${cmdChunks[2]},crop=${w}:${h}:(iw-${w})/2+${shiftX}:(ih-${h})/2+${shiftY}`
}
