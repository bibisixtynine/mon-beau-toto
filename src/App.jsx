import './App.css'

import { useState } from 'react'
import reactLogo from './assets/react.svg'

import PlayCanvas from './PlayCanvas'
import './PlayCanvas.css'

import TextInput from './TextInput'
import './TextInput.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img
            src="/vite.svg"
            className="logo"
            alt="Vite logo"
          //style = {{width: 120}}
          />
        </a>

        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more <br />
        So nice man !
      </p>
      <p>some taste of playcanvas ?</p>
      <PlayCanvas />

    </div>
  )
}

export default App
