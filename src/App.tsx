import React from 'react'
import SimpleDiffusion from './SimpleDiffusion/SimpleDiffusion'
import Particles, {
  ParticlesExplainer,
  ParticlesExplainerMechanicsDetailed,
} from './Particles/Particles'
import VectorField from './VectorField/VectorField'
import Introduction from './Text/Introduction'

const pages = {
  '/simple-diffusion': SimpleDiffusion,
  '/particles-simulation': Particles,
  '/particles-text': ParticlesExplainer,
  '/particles-text/mechanics-detailed': ParticlesExplainerMechanicsDetailed,
  '/discrete-field-simulation': VectorField,
  '/discrete-field-simulation/basic': VectorField,
  '/graph': () => null,
}

const Home = () => {
  return (
    <div
      style={{
        padding: '0 30px',
        maxWidth: 'max(min(100vh, 100vw) - 35px, 500px)',
        fontSize: 18,
      }}
    >
      <h1>Energetics and its Applications to Physics</h1>
      <p>This is the website for energetics. Here's the sitemap:</p>
      <ul>
        <li>
          <a href="/">/</a> (you are here)
        </li>
        <li>
          <a href="/discrete-field-simulation/basic">
            /discrete-field-simulation/basic
          </a>
        </li>
        <li>
          <a href="/particles-simulation">/particles-simulation</a>{' '}
          (recommended!)
        </li>
        <li>
          <a href="/particles-text">/particles-text</a>
          <ul>
            <li>
              <a href="/particles-text/mechanics-detailed">
                /../mechanics-detailed
              </a>
            </li>
          </ul>
        </li>
      </ul>
      <p>
        If you want to jump straight into a fun simulation, click one of the
        above links.
        <br />
        If you want to see the source code for this website or any of the
        simulations, go to{' '}
        <a
          href="https://github.com/ashtonsix/energetics"
          target="_blank"
          rel="noopener"
        >
          github.com/ashtonsix/energetics
        </a>
        .<br />
        If you want to learn what this website is all about, keep reading.
      </p>
      <h2>Main Text</h2>
      <Introduction />
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
