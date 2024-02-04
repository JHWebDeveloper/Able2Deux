import { useState, useEffect } from 'react'

export const usePreloadFont = (fonts = []) => {
  const [ fontsLoaded, setFontsLoaded ] = useState(false)

  useEffect(() => {
    (async () => {
      await Promise.all(fonts.map(async fontAttr => {
        const font = new FontFace(...fontAttr)

        await font.load()

        document.fonts.add(font)
      }))

      setFontsLoaded(true)
    })()
  }, [])

  return [ fontsLoaded ]
}
