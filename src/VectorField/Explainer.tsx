import React from 'react'
import Tex from '../Particles/Tex'

const ExplainerIntro = () => {
  return (
    <>
      <h2>Mechanics: How The Simulation Works</h2>
      <p>
        The simulation shows the evolution of a discrete vector field. To
        construct the field, imagine a grid, and in each grid cell imagine a
        vector with magnitude and direction. The grid cells cannot be
        sub-divided, an important detail. At each step this magnitude spreads
        across the field, like so:
      </p>
      <div style={{textAlign: 'center'}}>
        <img
          style={{maxWidth: '100%', padding: 10, border: '1px solid #ccc'}}
          alt="vector"
          src="/vector-field-txt/1.png"
        />
      </div>
      <p>
        Each step we construct an arc for each grid cell. The arc is parametised
        by length, radius, position, direction and magnitude. Magnitude is the
        only parameter that doesn't affect the arc's geometry. The length and
        radius come from global simulation parameters; the position, direction
        and magnitude come from the grid cell. We then divide each arc wherever
        it crosses between two grid cells, so we have a bunch of partial arcs
        for each arc. We then convert each part into a vector, the vector's
        magnitude is (partial arc length / arc length) · arc magnitude · flow
        rate, the vector bisects the partial arc and this defines its direction.
        Flow rate is a global simulation parameter. Focusing our attention back
        to the grid cells, their magnitude is now scaled by (1 - flow rate). For
        each grid cell we now have the one vector we started with (scaled), and
        a bunch of extra vectors which describe what the surrounding grid cells
        have contributed; we combine the vectors for each grid cell by taking
        the normalised sum of vectors, scaled by the sum of vector magnitudes,{' '}
        <Tex scale={0.85}>{`(\\widehat{\\sum x}) (\\sum \\|x\\|)`}</Tex>, which
        conserves their total magnitude and destroys some information about
        their direction. This finishes the step.
      </p>
      <p>
        Here's what two steps look like when we zoom-in really close, with a
        radius of 1.3 grid lengths, length of 120° degrees, and flow rate of
        70%:
      </p>
      <div style={{textAlign: 'center'}}>
        <img
          style={{
            maxWidth: '100%',
            height: 240,
            padding: 10,
            border: '1px solid #ccc',
          }}
          alt="vector"
          src="/vector-field-txt/2.png"
        />
      </div>
      <p>Here's what it looks like when two flows collide:</p>
      <div style={{textAlign: 'center'}}>
        <img
          style={{
            maxWidth: '100%',
            height: 240,
            padding: 10,
            border: '1px solid #ccc',
          }}
          alt="vector"
          src="/vector-field-txt/3.png"
        />
      </div>
      <p>
        Some grid cells are marked as “boundary” cells. They absorb energy like
        every other grid cell, and emit it all on the next step with a flow rate
        of 100% and length of 360°. The emissions from a boundary cell are
        weighted, such that partial arcs that overlap another boundary cell
        recieve nothing, and partial arcs overlapping non-boundary cells recieve
        everything.
      </p>
      <p>
        To change the size of the field and boundary placement, click “New
        Experiment” in the top-right. By removing the boundaries altogether, one
        may observe that the field wraps around like the surface of a torus. One
        may also observe, that with a large-enough arc radius, flows can
        teleport through boundaries.
      </p>
      <h2>Observations: How The Simulation Behaves</h2>
      <p>
        With an arc length &lt;180° a vortex emerges, and the vector magnitude
        moves as if acted upon by centrifugal force. This is similar to what can
        be observed in the particle simulator at{' '}
        <a href="/particles-simulation">/particles-simulation</a>.
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{width: 264, padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/vortex_field.png"
          />
          <p>Field Vortex</p>
        </span>
        <span style={{width: 264, padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #2"
            src="/vector-field-txt/vortex_particles.png"
          />
          <p>Particle Vortex</p>
        </span>
      </div>
      <p>
        With an arc length &gt;180° there emerge quasiparticles (light-coloured)
        and anti-quasiparticles (dark-coloured), which are both vortices. The
        vector magnitude moves as if acted upon by centripetal force. When a
        particle and antiparticle collide they both disappear, leaving just a
        bit of turbulence; they are usually, but not always, created and
        destroyed in pairs, so count(particles) - count(antiparticles) ≈ 0. From
        random initial conditions the simulation first evolves into a
        plasma-like collection of many particles, and then evolves into one of
        four stable structures:
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{width: 150, padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/phenotype_1.png"
          />
          <p>Single</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{width: 150, padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/phenotype_2.png"
          />
          <p>Double</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{width: 150, padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/phenotype_3.png"
          />
          <p>Quadruple</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{width: 150, padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/phenotype_4.png"
          />
          <p>Tile</p>
        </span>
      </div>
      <p>
        I call the stable structures the four phenotypes. Within each phenotype
        are many variations; they differ in terms of their overall stability,
        exact shape, and other charachteristics. Altering the simulation
        parameters affects what phenotypes and variations one is likely to see.
      </p>
      <p>Let's look at the quasiparticles' five most-visible sub-structures:</p>
      <ol>
        <li>Orbital waves</li>
        <li>Resonance waves</li>
        <li>Radial lines</li>
        <li>(Smooth) shear lines</li>
        <li>(Rough) shear lines</li>
      </ol>
      <p>
        These sub-structures are easiest to discern when showing “change in
        magnitude” rather than “magnitude”. In my view, the orbital and
        resonance waves are interesting, whereas the shear and radial lines are
        not, for there's no equivalent to these lines in the real-world.
        Altering the simulation parameters affects what sub-structures one is
        likely to see.
      </p>
      <p>
        Orbital waves are easy to observe with an arc length of 270° and flow
        rate of 100%. They are spiral-shaped. Orbital waves are caused by the
        particle wobbling, the wobbling resembles the orbit of our sun around
        the solar system's center of mass.
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/orbital_1.png"
          />
          <p>Magnitude</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/orbital_2.png"
          />
          <p>Change in magnitude</p>
        </span>
      </div>
      <p>
        For collections of many particles, resonance waves are easy to observe
        with an arc length of 210° (reduces particle wobbling), when one yoinks
        the contrast up, and blurs their screenshots in photoshop to hide the
        rough shear lines. They look snake-like, and appear because of the
        quasiparticle's spin.
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/resonance_0.png"
          />
          <p>Magnitude</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/resonance_1.png"
          />
          <p>Change in magnitude</p>
        </span>
      </div>
      <p>
        For collections of many particles, resonance waves appear more complex
        and unpredictable than they actually are. If one were to take a stable
        structure, measure the magnitude at a point affected by resonance waves
        as a time series, and apply a fast fourier transform to that time
        series, one would probably discover a linear superposition of{' '}
        <Tex>{`n`}</Tex> simple sinusoids, plus some noise, where{' '}
        <Tex>{`n`}</Tex> is the number of particles in the structure.
      </p>
      <p>
        It is much easier to understand what's going on with resonance waves
        when looking at a single isolated particle. The exact sequence varies
        run-by-run, but generally, when a single particle forms its resonance
        waves evolve according to the same sequence of steps. At first, the
        waves are intricately-shaped, pulsate, and have a quadrupole moment
        (four-fold symmetry). Then the pulsing slows down and the shape becomes
        geometrically simple, just as the waves start wobbling side-to-side. The
        side-to-side wobbling intensifies, transforming the quadrupole into a
        dipole (two-fold symmetry), and then settles down; the evolution is
        complete. The quadrupole and dipole moments both spin.
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/resonance_2.png"
          />
          <p>t=1</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/resonance_3.png"
          />
          <p>t=2</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/resonance_4.png"
          />
          <p>t=3</p>
        </span>
      </div>
      <p>
        The particles both spin and rotate (they're different), and the waves
        show how. Because of the simulation's mechanics, vector magnitude always
        moves at the same speed, as determined by the arc radius; let's call
        that the speed of light. So a particle's magnitude rotates about the
        center at the speed of light, and the closer this magnitude is to the
        center the more revolutions it completes per time unit, because there's
        less distance to travel for a revolution (like how years on Mercury are
        shorter than years on Pluto). This rotatation, in combination with any
        unevenness in the particle, is what gives it an orbital wobble. The
        rotation cannot be observed for a particle with no orbital wobble, since
        it's like rotating a perfect sphere: it looks the same no matter how
        it's rotated. Rotating a perfect sphere is like stepping into a river
        twice.
      </p>
      <p>
        Whereas a particle's magnitude rotates, its polar moment spins. As the
        moment evolves into a dipole,
      </p>
      <p>
        Radial lines are easy to observe when the flow rate is 1%, and one
        sharpens their screenshots in photoshop. They look like evenly-spaced
        water ripples on a pond, around the boundary and each particle. They are
        not waves (the resemblance is superficial), don't appear to meaningly
        affect anything, and can be wholly ignored. They are caused by the arc
        radius behaviour.
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/radial.png"
          />
          <p>Radial lines</p>
        </span>
      </div>
      <p>
        Smooth shear lines are easy to observe when the arc length is close-ish
        to 180°. They're filament-looking things that connect particles and
        antiparticles. Rough shear lines are easy to observe when one does not
        have a visual impairment. Like smooth shear lines they're
        filament-looking things that connect particles and antiparticles, except
        they look “pixelated”, and are generally greater in number. The number
        of rough shear lines per particle scales with arc radius, and is
        proportional to the number of grid cells an arc covers.
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{height: 192, padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/vector-field-txt/smooth_shear.png"
          />
          <p>Smooth shear lines</p>
        </span>
        <span style={{width: 364, padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, height: 192, border: '1px solid #ccc'}}
            alt=""
            src="/vector-field-txt/vortex_interaction.png"
          />
          <p>
            Rough shear lines in a tile structure,
            <br />
            along with radial lines and resonance waves
          </p>
        </span>
      </div>
      <p>
        Shear lines are clearly affected by particles. Do shear lines affect
        particles in turn? When the number of shear lines are few, yes.
        Particles want to become as round as possible and shear lines interfere
        with that goal. It is unclear whether their significance extends beyond
        that, or whether they do much of signifance when great in number. Shear
        lines may play a role in the creation and destruction of particles,
        and/or in pulling and pushing particles around, but I'm not sure.
      </p>
      <div style={{textAlign: 'center'}}>
        <img
          style={{
            maxWidth: '100%',
            padding: 10,
            border: '1px solid #ccc',
          }}
          alt="vector"
          src="/vector-field-txt/5.png"
        />
        <p>Rough shear lines go straight when there's just one particle</p>
      </div>
      <p>
        If you want to see more behaviour, then play around with the simulation.
        Like, removing the boundary and setting the arc length to exactly 180°
        causes antiparticles behave identically to particles. That's something
        you could try. There's a different kind of particle that starts showing
        up with an arc length of &gt;359.99°. You could try an arc length of 1°
        or try making the boundary into a different shape. Do whatever.
      </p>
      <h2>Explanation: Why the Simulation Behaves As It Does</h2>
      <p></p>
      <h2>Speculation: Connections To the Real World</h2>
      <p style={{borderLeft: '4px solid #999', paddingLeft: 20}}>
        <strong>Note:</strong> Equivalents to real-world quantum phenomena can
        be observed in this simulation. However, they do not necessarily
        match-up with real-world physics. Any direct conclusions drawn from this
        simulation are very likely to be incorrect. This research is a
        preliminary exercise, it's purpose is to inspire ideas worth a closer
        look.
      </p>
      <p>
        Analagous to particle spin and electromagnetic forces, as described by
        Hans Ohanian in 1985 (
        <a
          target="_blank"
          rel="noopener"
          href="https://physics.mcmaster.ca/phys3mm3/notes/whatisspin.pdf"
        >
          What Is Spin?
        </a>
        )
      </p>

      <p>
        Depending on the situation the quasiparticles may either push or pull on
        each other, exerting what seems equivalent to an electromagnetic force.
        Both the electromagnetic and strong forces are mediated through the
        exchange of virtual particles, which form filaments called flux tubes.
        Although the simulation seems to have an electromagnetic force
        equivalent, we observe no obvious equivalents to virtual particles or
        flux tubes, indicating a different mechanism at work.
      </p>
      <p>
        The quasiparticles have smooth shear lines, rough shear lines, rough
        ripple lines
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{width: 364, padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, width: 342, border: '1px solid #ccc'}}
            alt=""
            src="/vector-field-txt/pion_jefferson.png"
          />
          <p>
            Artistic rendering of interacting particles. The filaments are flux
            tubes, made of virtual particles. Credit:{' '}
            <a
              target="_blank"
              rel="noopener"
              href="https://www.jlab.org/research/pionslqcd"
            >
              Jefferson Lab
            </a>
          </p>
        </span>
      </div>
      <p>
        Each quasiparticle has spin, orbital momentum, mass, exergy, magnetic
        moment When we look at the change in magnitude between steps we see
        filaments connecting the quasiparticles to anti-quasiparticles, and they
        possess a superficial resemblance to flux tubes or perhaps ferromagnetic
        field lines, however it's unclear whether those filaments actually have
        any real-world significance.
      </p>

      <p>Two intertwined spirals</p>
      <p>
        Let's highlight some of the behavioural differences between this
        simulator and quantum mechanics (weak Copenhagen interpretation). These
        quasiparticles are not points, and the magntiude in the field does not
        correspond to the probability of their being a particle at that point.
        One would not be able to replicate the double-slit experiment in this
        simulator, because the waves are of very similar wavelengths and
        destructively interfere before they hit the screen.
      </p>
      <h2>Play Pretend: Dialing Speculation Up To 11</h2>
      <h2>Future: How I Want To Improve The Simulation</h2>
      <p>
        <strong>Performance:</strong> I hope to make the simulation 3D
      </p>
      <p>Spin down if it goes clockwise, spin up if it goes anti-clockwise</p>
    </>
  )
}

export default ExplainerIntro
