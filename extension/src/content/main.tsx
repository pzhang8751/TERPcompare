import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './views/App.tsx'

console.log('[CRXJS] Hello world from content script!')

const container = document.createElement('div')
container.id = 'crxjs-app'
document.body.appendChild(container)
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)


// Restore state on load
chrome.storage.local.get('sidebarEnabled', ({ sidebarEnabled }) => {
  if (sidebarEnabled === false) {
    container.style.display = 'none'
  }
})

// Listen for toggle messages from popup
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'TOGGLE_SIDEBAR') {
    container.style.display = msg.visible ? 'block' : 'none'
  }
})