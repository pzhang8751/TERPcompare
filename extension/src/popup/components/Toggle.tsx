import { useState, useEffect, useRef } from 'react'
import './Toggle.css'

export default function SidebarToggle() {
    const [enabled, setEnabled] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        chrome.storage.local.get('sidebarEnabled', (result) => {
            const stored = (result as { sidebarEnabled?: boolean }).sidebarEnabled
            setEnabled(stored ?? false)
            // wait for paint then re-enable transitions
            requestAnimationFrame(() => setMounted(true))
        })
    }, [])

    const handleToggle = () => {
        const next = !enabled
        setEnabled(next)
        chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
            if (tab.id !== undefined) {
                chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_SIDEBAR', visible: next })
            }
        })
        chrome.storage.local.set({ sidebarEnabled: next })
    }

    return (
        <div className="toggle-wrap">
            <span className={`toggle-label ${!enabled ? 'toggle-label--off' : ''}`}>Off</span>

            <div
                className={`toggle-track ${enabled ? 'toggle-track--on' : ''} ${!mounted ? 'toggle-track--no-transition' : ''}`}
                onClick={handleToggle}
            >
                <div className={`toggle-thumb ${enabled ? 'toggle-thumb--on' : ''} ${!mounted ? 'toggle-thumb--no-transition' : ''}`} />
            </div>

            <span className={`toggle-status ${enabled ? 'toggle-status--on' : ''}`}>On</span>
        </div>
    )
}