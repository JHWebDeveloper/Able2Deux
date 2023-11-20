export const createHistoryStack = (size = 200) => {
	let _stack = []
	let _fixed = {}
	let _head = 0

	const _push = state => {
		_stack.splice(0, _head, structuredClone(state))
		_head = 0
		
		while (_stack.length > size) _stack.pop()
	}

	const _get = index => structuredClone({
		..._stack[index],
		fixed: _fixed
	})

	return {
		connectReducer(reducer) {
			return (state, action) => {
				const nextState = reducer(state, action, this)

				if ('fixed' in state) _fixed = { ...state.fixed }
				if (!action?.payload?.omitFromHistory) _push(nextState)

				return nextState
			}
		},
		undo() {
			return _get(_head === _stack.length - 1 ? _head : ++_head)
		},
		redo() {
			return _get(_head ? --_head : _head)
		},
		clear() {
			_stack = _stack.splice(_head, 1)
			_head = 0

			return _get(_head)
		}
	}
}
