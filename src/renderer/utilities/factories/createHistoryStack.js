export const createHistoryStack = (size = 200) => {
	let _stack = []
	let _head = 0

	const _push = state => {
		_stack.splice(0, _head, structuredClone(state))
		_head = 0
		
		while (_stack.length > size) _stack.pop()
	}

	return {
		connectReducer(reducer) {
			return (state, action) => {
				const nextState = reducer(state, action, this)

				if (!action?.payload?.omitFromHistory) _push(nextState)

				return nextState
			}
		},
		undo() {
			return structuredClone(_stack[_head === _stack.length - 1 ? _head : ++_head])
		},
		redo() {
			return structuredClone(_stack[_head ? --_head : _head])
		},
		clear() {
			_stack = _stack.splice(_head, 1)
			_head = 0

			return structuredClone(_stack[_head])
		}
	}
}
