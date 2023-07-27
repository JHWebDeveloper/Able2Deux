import { useRef, useCallback } from 'react'

export const useClipboard = () => {
  const clipboard = useRef({})

  const copyToClipboard = useCallback(properties => {
    clipboard.current = { ...properties }
  }, [])

  return [ clipboard.current, copyToClipboard ]
}

export default useClipboard
