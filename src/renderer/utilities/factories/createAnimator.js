export const createAnimator = () => {
	let _frameDelay = 1
	let _frames = 1
	let _request = false
	let _onFrame = false
	let _onStop = false

	const _pause = () => {
		cancelAnimationFrame(_request)
	}

	const _loop = () => {
		_request = requestAnimationFrame(_loop)

		if (_frames === _frameDelay) {
			_frames = 0
			_onFrame?.(_pause)
		}

		_frames++
	}

	return {
		onFrame(cb, frameDelay = 1) {
			_onFrame = cb
			_frameDelay = frameDelay
			_frames = frameDelay
			return this
		},
		onStop(cb) {
			_onStop = cb
			return this
		},
		start() {
			_request = requestAnimationFrame(_loop)
			return this
		},
		stop() {
			_pause()
			_onStop?.()
			return this
		}
	}
}
