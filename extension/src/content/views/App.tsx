import Logo from '@/assets/logo.png?inline'
import Screen from '../components/Screen'
import { useState } from 'react'
import './App.css'

function App() {
  const [show, setShow] = useState(false)
  const toggle = () => setShow(!show)
  console.log(Logo)

  return (
    <div className="popup-container">
      {show && (
        <div className={`popup-content ${show ? 'opacity-100' : 'opacity-0'}`}>
          <Screen></Screen>
        </div>
      )}
      <button className="toggle-button" onClick={toggle}>
        <img src={Logo} alt="TERPCompare logo" className="button-icon" />
      </button>
    </div>
  )
}

export default App
