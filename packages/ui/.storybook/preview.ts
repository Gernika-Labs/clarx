import type { Preview } from '@storybook/react-vite'
import * as React from 'react'
import '../storybook.css'

const preview: Preview = {
  decorators: [
    (Story) =>
      React.createElement(
        'div',
        { className: 'dark min-h-screen bg-zinc-950 text-zinc-100' },
        React.createElement(Story)
      ),
  ],
  parameters: {
    docs: {
      disable: true,
    },
    controls: {
      expanded: true,
      sort: 'requiredFirst',
    },
    backgrounds: {
      default: 'dark-canvas',
      values: [
        { name: 'dark-canvas', value: '#09090b' },
      ],
    },
    layout: 'fullscreen',
  },
}

export default preview
