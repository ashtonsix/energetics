import React from 'react'
import Particles, {
  ParticlesExplainer,
  ParticlesExplainerMechanicsDetailed,
} from './Particles/Particles'
import VectorField from './VectorField/VectorField'
import Home from './Text/Home'
import NeutronAsAnEcosystem from './Text/Neutron'
import Roadmap from './Text/Roadmap'
import DiscreteMultiField from './DiscreteMultifield/DiscreteMultiField'

const pages = {
  '/introduction': Home,
  '/particle-simulation': Particles,
  '/particle-simulation/text': ParticlesExplainer,
  '/particle-simulation/text/mechanics-detailed':
    ParticlesExplainerMechanicsDetailed,
  '/discrete-field-simulation': VectorField,
  '/discrete-multifield-simulation': DiscreteMultiField,
  '/neutron-as-an-ecosystem': NeutronAsAnEcosystem,
  '/roadmap': Roadmap,
}

const App = () => {
  const Component = pages[window.location.pathname.replace(/\/$/g, '')]

  if (!Component) {
    window.location.replace('/introduction')
    return null
  }

  return (
    <div className="App-Container">
      <style>
        {`
          .App-Container {
            padding: 5px;
          }
        `}
      </style>
      {Component !== Home && <a href="/introduction">Home</a>}
      <Component />
    </div>
  )
}

export default App
