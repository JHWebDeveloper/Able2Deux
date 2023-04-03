import { useReducer } from 'react'

export const useAugmentedDispatch = (reducer, initState) => {
  const [ state, dispatch ] = useReducer(reducer, initState)

  const augmentedDispatch = input => input instanceof Function ? input(dispatch, state) : dispatch(input)

  return [ state, augmentedDispatch ]
}
