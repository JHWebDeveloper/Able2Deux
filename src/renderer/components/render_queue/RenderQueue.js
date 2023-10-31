import React from 'react'

import { RenderQueueProvider } from 'store'

const RenderQueue = () => {
  return (
    <RenderQueueProvider>
      <div>RenderQueue</div>
    </RenderQueueProvider>
  )
}

export default RenderQueue
