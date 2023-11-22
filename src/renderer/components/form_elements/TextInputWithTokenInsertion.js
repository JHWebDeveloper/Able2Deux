import React, { memo, useCallback, useRef } from 'react'
import { func, number, string } from 'prop-types'

import { objectsAreEqual } from 'utilities'

import FieldsetWrapper from './FieldsetWrapper'
import PopupMenu from './PopupMenu'

const popup = insertToken => [
	{
		type: 'spacer',
		label: 'Date/Timestamps'
	},
	{
		type: 'button',
		label: 'Long Date',
		shortcut: '$d',
		action() {
			insertToken('$d')
		}
	},
	{
		type: 'button',
		label: 'Short Date',
		shortcut: '$D',
		action() {
			insertToken('$D')
		}
	},
	{
		type: 'button',
		label: '12hr Timestamp',
		shortcut: '$t',
		action() {
			insertToken('$t')
		}
	},
	{
		type: 'button',
		label: '24hr Timestamp',
		shortcut: '$T',
		action() {
			insertToken('$T')
		}
	},
	{
		type: 'spacer',
		label: 'Numbering'
	},
	{
		type: 'button',
		label: 'Clip Number',
		shortcut: '$n',
		action() {
			insertToken('$n')
		}
	},
	{
		type: 'button',
		label: 'Total Clips',
		shortcut: '$l',
		action() {
			insertToken('$l')
		}
	},
	{
		type: 'button',
		label: 'Instance Number',
		shortcut: '$i',
		action() {
			insertToken('$i')
		}
	},
	{
		type: 'button',
		label: 'Total Instances',
		shortcut: '$li',
		action() {
			insertToken('$li')
		}
	},
	{
		type: 'button',
		label: 'Version Number',
		shortcut: '$v',
		action() {
			insertToken('$v')
		}
	},
	{
		type: 'button',
		label: 'Total Versions',
		shortcut: '$lv',
		action() {
			insertToken('$lv')
		}
	},
	{
		type: 'button',
		label: '$n of $l',
		action() {
			insertToken('$n of $l')
		}
	},
	{
		type: 'button',
		label: '$i of $li',
		action() {
			insertToken('$i of $li')
		}
	},
	,
	{
		type: 'button',
		label: '$v of $lv',
		action() {
			insertToken('$v of $lv')
		}
	},
	{
		type: 'spacer',
		label: 'Timecodes'
	},
	{
		type: 'button',
		label: 'Start Timecode',
		shortcut: '$s',
		action() {
			insertToken('$s')
		}
	},
	{
		type: 'button',
		label: 'End Timecode',
		shortcut: '$e',
		action() {
			insertToken('$e')
		}
	},
	{
		type: 'button',
		label: 'Source Runtime',
		shortcut: '$r',
		action() {
			insertToken('$r')
		}
	},
	{
		type: 'button',
		label: 'Clip Runtime',
		shortcut: '$c',
		action() {
			insertToken('$c')
		}
	},
	{
		type: 'button',
		label: '$s - $e',
		action() {
			insertToken('$s - $e')
		}
	},
	{
		type: 'button',
		label: '$s - $e of $r',
		action() {
			insertToken('$s - $e of $r')
		}
	}
]

const TextInputWithTokenInsertion = memo(({
	label,
	name,
	value,
	maxLength,
	placeholder,
	alignment = 'bottom right',
	onChange
}) => {
	const textInput = useRef(null)
	const cursorPos = useRef({
		selectionStart: value.length,
		selectionEnd: value.length
	})

	const updateCursorPos = useCallback(() => {
		const { selectionStart, selectionEnd } = textInput.current

		cursorPos.current = { selectionStart, selectionEnd }
	}, [])

	const insertToken = token => {
		onChange({
			name,
			value: `${value.slice(0, cursorPos.current.selectionStart)}${token}${value.slice(cursorPos.current.selectionEnd)}`
		})

		cursorPos.current.selectionStart += token.length
		cursorPos.current.selectionEnd = textInput.current.selectionStart = textInput.current.selectionEnd = cursorPos.current.selectionStart
	}

	return (
		<FieldsetWrapper
			label={label}
			className="text-with-token-insert">
			<span>
				<input
					ref={textInput}
					type="text"
					className="panel-input"
					name={name}
					value={value}
					maxLength={maxLength}
					placeholder={placeholder}
					onChange={onChange}
					onSelect={updateCursorPos} />
				<PopupMenu
					icon="attach_money"
					label="Insert Replacement Token"
					alignment={alignment}
					options={() => popup(insertToken)} />
			</span>
		</FieldsetWrapper>
	)
}, objectsAreEqual)

TextInputWithTokenInsertion.propTypes = {
	label: string.isRequired,
	name: string.isRequired,
	value: string,
	maxLength: number,
	placeholder: string,
	alignment: string,
	onChange: func.isRequired
}

export default TextInputWithTokenInsertion
