import React from 'react'
import ExplainerMechanics from './ExplainerMechanics'

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
      <h2>
        Methodology: How I Discovered Interesting Things And Measured Them
      </h2>
      {/* https://www.youtube.com/watch?v=zRxI0DaQrag&list=PLZRRxQcaEjA7LX19uAySGlc9hmprBxfEP&index=5 */}
    </div>
  )
}

export default Explainer
