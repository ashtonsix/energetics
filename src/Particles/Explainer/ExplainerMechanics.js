import React from 'react'
import Tex from '../Tex'

const ExplainerMechanics = () => {
  return (
    <>
      <h2>Mechanics: How The Simulation Works</h2>
      <p>The simulation is parameterised by:</p>
      <ol style={{maxWidth: 600}}>
        <li>
          Parameters
          <ul>
            <li>
              <Tex>{`E, 0\\text{ }<=\\text{ Particle Elasticity} <= 2`}</Tex>
            </li>
            <li>
              <Tex>{`\\text{Boundary Elasticity} \\in \\{\\text{True}, \\text{False}\\}`}</Tex>
            </li>
            <li>
              <Tex>{`\\text{Constant Mass} \\in \\{\\text{True}, \\text{False}\\}`}</Tex>
            </li>
            <li>
              <Tex>{`\\text{Constant Velocity} \\in \\{\\text{True}, \\text{False}\\}`}</Tex>
            </li>
            <li>
              <Tex>{`\\text{if Constant Mass = False, Constant Velocity = False}`}</Tex>
            </li>
            <li>
              <Tex>{`\\text{if Constant Velocity = True, Constant Mass = True}`}</Tex>
            </li>
          </ul>
        </li>
        <li>The boundary, a set of (possibly infinitely-sided) polygons</li>
        <li>
          A set of particles, each particle has the following attributes:
          <ul>
            <li>
              <Tex>{`r, \\text{Radius}`}</Tex>
            </li>
            <li>
              <Tex>{`p, \\text{Position}`}</Tex>
            </li>
            <li>
              <Tex>{`v, \\text{Velocity}, 1\\text{ if Constant Velocity}`}</Tex>
            </li>
            <li>
              <Tex>{`m, \\text{Mass}, 1\\text{ if Constant Mass else }r^2`}</Tex>
            </li>
            <li>
              <Tex>{`\\mathbf{p}, \\text{Momentum}, \\|v\\| \\cdot m`}</Tex>
            </li>
            <li>
              We may switch between cartesian (eg, <Tex>{`p_x`}</Tex> and{' '}
              <Tex>{`p_y`}</Tex>) and polar coordinates (eg,{' '}
              <Tex>{`p_{\\theta}`}</Tex> and <Tex>{`\\|p\\|`}</Tex>) as deemed
              appropriate
            </li>
          </ul>
        </li>
      </ol>
      <p>
        Starting from random initial conditions (within the constraints set by
        the spawn area), particles travel at constant linear velocity, until
        they collide with another particle or the boundary. When they collide
        with the boundary they are reflected if{' '}
        <Tex>{`\\text{Boundary Elasticity = True}`}</Tex> (the angle of
        reflection equals the angle of incidence), otherwise they stick to the
        boundary (the angle of reflection is 90°).
      </p>
      <p>
        When two particles collide they are scattered in the usual way, which is
        to say the velocity component of particle 1 projected onto the collision
        normal (<Tex>{`p_1 - p_2`}</Tex>), <Tex>{`v_1^n`}</Tex>, is modified
        according to the following formula (particle 2 is also modified,
        similarly and simultaneously):
      </p>
      <p style={{textAlign: 'center'}}>
        <Tex
          block
        >{`v_1^n := \\frac{E m_2 (v_2^n - v_1^n) + m_1 v_1^n + m_2 v_2^n}{m_1 + m_2}`}</Tex>
      </p>
      <p>
        We then depart from the usual way. If{' '}
        <Tex>{`\\text{Constant Velocity = True}`}</Tex> we scale{' '}
        <Tex>{`v_1`}</Tex> and <Tex>{`v_2`}</Tex>, so{' '}
        <Tex>{`\\|v_1\\| = 1`}</Tex> and <Tex>{`\\|v_2\\| = 1`}</Tex>.
        Otherwise, we scale <Tex>{`v_1`}</Tex> and <Tex>{`v_2`}</Tex> by{' '}
        <Tex>{`\\mathbf{p}_{initial} / \\mathbf{p}_{current}`}</Tex>, where{' '}
        <Tex>{`\\mathbf{p}_{initial}`}</Tex> is the value of{' '}
        <Tex>{`\\mathbf{p}_1 + \\mathbf{p}_2`}</Tex> taken before the collision
        and <Tex>{`\\mathbf{p}_{current}`}</Tex> is the value of{' '}
        <Tex>{`\\mathbf{p}_1 + \\mathbf{p}_2`}</Tex> taken after the usual
        scattering formula has been applied. In the usual way, an inelastic or
        superelastic collision does not conserve kinetic energy and, to makeup
        the discrepancy, we get a corresponding change in each particle’s
        internal energy. In this simulation, collisions always conserve kinetic
        energy (and internal energy, which one can assume is <Tex>{`{=}0`}</Tex>{' '}
        for each particle).
      </p>
      <p>
        I made an interactive calculator so one can play around with particle
        collisions if they want:{' '}
        <a
          href="https://www.desmos.com/calculator/npdxi0rwe4"
          target="_blank"
          rel="noopener"
        >
          www.desmos.com/calculator/npdxi0rwe4
        </a>
      </p>
      <iframe
        title="particle collision"
        src="https://www.desmos.com/calculator/npdxi0rwe4?embed"
        width="100%"
        height="500"
        style={{border: 'solid 2px #ccc'}}
        frameBorder="0"
      ></iframe>
      <p>
        For a more detailed description of the simulation’s mechanics, including
        a breakdown of what every option does, what effect changing them has on
        the particle attributes, a guide to unlocking the simulation's hidden
        features, and the full set of mathematical equations used, including
        approximations used, see{' '}
        <a href="/particles-text/mechanics-detailed">
          /particles-text/mechanics-detailed
        </a>
        . For the source code, see{' '}
        <a
          target="_blank"
          rel="noopener"
          href="https://github.com/ashtonsix/energetics" // TODO: point to Simulation.js
        >
          github.com/ashtonsix/energetics
        </a>
        .
      </p>
    </>
  )
}

export default ExplainerMechanics
