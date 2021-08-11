import React from 'react'
import SimpleDiffusion from './SimpleDiffusion/SimpleDiffusion'
import Particles, {ParticlesExplainer} from './Particles/Particles'
import VectorField from './VectorField/VectorField'

const pages = {
  '/simple-diffusion': SimpleDiffusion,
  '/particles': Particles,
  '/particles-explainer': ParticlesExplainer,
  '/vector-field': VectorField,
  '/graph': () => null,
}

const Home = () => {
  return (
    <div>
      <h1>Energetics and its Applications to Physics</h1>
      <p>
        This website hosts the{' '}
        <a
          href="https://docs.google.com/document/d/1-HOAAGlm_hAhoz9qK73FTY5vKs2-Qz2rmfLNXJrSDLg/edit?usp=sharing"
          target="_blank"
          rel="noreferrer"
        >
          full text
        </a>{' '}
        and simulations for <i>Energetics and its Applications to Physics</i>.
        For the source code, see{' '}
        <a
          href="https://github.com/ashtonsix/energetics"
          target="_blank"
          rel="noreferrer"
        >
          github.com/ashtonsix/energetics
        </a>
      </p>
      <h2>Simulations</h2>
      <ul>
        <li>
          <a href="/simple-diffusion">Simple Diffusion</a>
        </li>
        <li>
          <a href="/particles">Particles</a>
        </li>
        <li>
          <a href="/vector-field">Vector Field</a>
        </li>
        <li>
          <a href="/graph">Graph</a>
        </li>
      </ul>
    </div>
  )
}

const App = () => {
  const Component = pages[window.location.pathname] || Home
  return (
    <div className="App-Container">
      <style>
        {`
            .App-Container {
              padding: 5px;
            }
          `}
      </style>
      {Component !== Home && <a href="/">Home</a>}
      <Component />
    </div>
  )
}

export default App
