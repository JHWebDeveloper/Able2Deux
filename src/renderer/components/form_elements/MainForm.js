import React from 'react'
import { arrayOf, element, oneOfType } from 'prop-types'

/**
 * Wrap every page's content in a form so we can symantically allow use of the fieldset element
 * This is the only function of the form element in Able2 so we disable submit.
 */

const MainForm = ({ children }) => (
  <main>
    <form onSubmit={e => e.preventDefault()}>
      {children}
    </form>
  </main>
)

MainForm.propTypes = {
  children: oneOfType([element, arrayOf(element)]).isRequired
}

export default MainForm
