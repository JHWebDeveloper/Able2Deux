import React from 'react'

import DirectorySelector from '../form_elements/DirectorySelector'

const Directory = ({ dir, index, dispatch }) => {
	const { checked, label, directory, id } = dir

	return (
		<>
			<input
        type="checkbox"
        checked={checked}
        title="Selected by default"
				//onChange={() => dispatch(checkDefault(id))}
				 />
      <button
				type="button"
				name="add"
				className="app-button symbol"
        title="Add directory"
        //onClick={e => dispatch(addNewDirectory(index, e))}
				>
        add
			</button>
      <button
				type="button"
				name="delete"
				className="app-button symbol"
        title="Delete directory"
        //onClick={() => dispatch(deleteDirectoryWarn(id, label))}
				>
        remove
			</button>
      <input
        type="text"
        name="label"
        value={label}
        //onChange={e => dispatch(updateLabel(id, e))}
        aria-labelledby="label" />
			<DirectorySelector
				directory={directory} />
      {/* <button
				type="button"
				className="app-button symbol"
        title="Choose directory"
				//onClick={() => dispatch(chooseDirectory(id))}
				>
        folder
			</button>
      <input
        type="text"
        name="directory"
        value={directory}
        aria-labelledby="folder"
        readOnly /> */}
      <button
				type="button"
				name="up"
				className="app-button symbol"
        title="Move directory up"
				//onClick={() => dispatch(moveDirectory(dir, index - 1))}
				>
				keyboard_arrow_up
			</button>
      <button
				type="button"
				name="down"
				className="app-button symbol"
        title="Move directory down"
        onClick={() => dispatch(moveDirectory(dir, index + 1))}>
				keyboard_arrow_down
			</button>
		</>
	)
}

export default Directory
