import React from 'react'
import ExplainerMechanics from './ExplainerMechanics'
import ExplainerMethodology from './ExplainerMethodology'

const Explainer = () => {
  return (
    <div
      style={{
        maxWidth: 'calc(max(min(100vh, 100vw) - 65px, 500px))',
        fontSize: '18px',
      }}
    >
      <h1>Ashton's Particle Simulator</h1>
      <ExplainerMechanics />
      <ExplainerMethodology />
    </div>
  )
}

export default Explainer
