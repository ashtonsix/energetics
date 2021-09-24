import React from 'react'
import Tex from '../Text/Tex'
import ExplainerDiffusion from './ExplainerDiffusion'

const ExplainerIntro = () => {
  return (
    <>
      <h2 id="text">Mechanics: How The Simulation Works</h2>
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
          alt="mechanics_1"
          src="/vector-field-txt/mechanics_1.png"
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
          alt="mechanics_2"
          src="/vector-field-txt/mechanics_2.png"
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
          alt="mechanics_3"
          src="/vector-field-txt/mechanics_3.png"
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
            alt="vortex_field"
            src="/vector-field-txt/vortex_field.png"
          />
          <p>Field Vortex</p>
        </span>
        <span style={{width: 264, padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="vortex_particles"
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
            alt="phenotype_1"
            src="/vector-field-txt/phenotype_1.png"
          />
          <p>Single</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{width: 150, padding: 10, border: '1px solid #ccc'}}
            alt="phenotype_2"
            src="/vector-field-txt/phenotype_2.png"
          />
          <p>Double</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{width: 150, padding: 10, border: '1px solid #ccc'}}
            alt="phenotype_3"
            src="/vector-field-txt/phenotype_3.png"
          />
          <p>Quadruple</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{width: 150, padding: 10, border: '1px solid #ccc'}}
            alt="phenotype_4"
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
        magnitude” rather than “magnitude”. Altering the simulation parameters
        affects what sub-structures one is likely to see.
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
            alt="orbital_1"
            src="/vector-field-txt/orbital_1.png"
          />
          <p>Magnitude</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="orbital_2"
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
            alt="resonance_0"
            src="/vector-field-txt/resonance_0.png"
          />
          <p>Magnitude</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="resonance_1"
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
            alt="resonance_2"
            src="/vector-field-txt/resonance_2.png"
          />
          <p>t=1</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="resonance_3"
            src="/vector-field-txt/resonance_3.png"
          />
          <p>t=2</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="resonance_4"
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
        moment evolves into a dipole, spin at the center and outskirt of a
        particle fully synchronise with each other. The moment spins at the
        speed of light at the particle's outskirt, but goes much slower towards
        the center, so it takes the same amount of time to complete a revolution
        no matter where one measures from. The larger a particle, the slower its
        total spin, in such a way that the momentum of a particle's spin doesn't
        change with the size of a particle. This concludes our wave-related
        observations.
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
            alt="radial"
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
            alt="smooth_shear"
            src="/vector-field-txt/smooth_shear.png"
          />
          <p>Smooth shear lines</p>
        </span>
        <span style={{width: 364, padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, height: 192, border: '1px solid #ccc'}}
            alt="rough_lines_1"
            src="/vector-field-txt/rough_lines_1.png"
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
          alt="rough_lines_2"
          src="/vector-field-txt/rough_lines_2.png"
        />
        <p>Rough shear lines go straight when there's just one particle</p>
      </div>
      <p>
        OK, so we've looked at the four structures and five sub-structures. Now
        let's try to come up with a numerical way to describe the particles, a
        list of properties and values. I haven't developed the software to the
        point where I can precisely measure and control these values, but based
        on gut feeling I think the following should work:
      </p>
      <ol>
        <li>
          Momentum Vector
          <ul>
            <li>
              Point A refers to the particle's center of magnitude. Point B
              refers to the point where curl (as in vector analysis) is at its
              maximum. The momentum vector goes from A to B.
            </li>
          </ul>
        </li>
        <li>
          Linear Momentum
          <ul>
            <li>
              Linear combination of all grid cell vectors within the particle
              projected onto the momentum vector.
            </li>
          </ul>
        </li>
        <li>
          Orbital Momentum
          <ul>
            <li>
              Linear combination of all grid cell vectors within the particle
              projected onto the tangent to the momentum vector.
            </li>
          </ul>
        </li>
        <li>
          Spin
          <ul>
            <li>
              Angular momentum of polar moment. -0.5 if spin is clockwise (spin
              down), 0.5 if spin is anti-clockwise (spin up). For more details
              see Hans Ohanian's 1985 paper,{' '}
              <a
                target="_blank"
                rel="noopener"
                href="https://physics.mcmaster.ca/phys3mm3/notes/whatisspin.pdf"
              >
                What Is Spin?
              </a>
            </li>
          </ul>
        </li>
        <li>
          Polar Moment
          <ul>
            <li>
              Current orientation of polar moment.{' '}
              <Tex>{`-\\pi < x < \\pi`}</Tex>.
            </li>
          </ul>
        </li>
        <li>
          Inertial Mass
          <ul>
            <li>Total curl of field within particle.</li>
          </ul>
        </li>
        <li>
          Graviational Mass
          <ul>
            <li>
              Zero, because the field is flat. We're looking at special
              relativity rather than general relativity here.
            </li>
          </ul>
        </li>
        <li>
          Velocity
          <ul>
            <li>
              Linear Momentum divided by Inertial Mass. Absolute, not relative.
            </li>
          </ul>
        </li>
        <li>
          Position
          <ul>
            <li>
              Magnitude of field as an elastic scattering propensity
              distribution. For the difference between propensity and
              probability see Karl Popper's lecture,{' '}
              <a
                rel="noopener"
                target="_blank"
                href="https://www.google.com/search?q=a+world+of+propensities"
              >
                A World of Propensities
              </a>
              .
            </li>
          </ul>
        </li>
        <li>
          Rotation Speed
          <ul>
            <li>
              Revolutions per time unit for a point <Tex>{`x`}</Tex> distance
              from the particle's center of magntiude, with linear scaling
              applied, such that at rest a particle's rotation speed is always
              defined as the speed of light. For a particle with some velocity,
              the point used to measure rotation speed will have to travel
              further to complete a single revolution and so the rotation speed
              will drop, approaching zero as the particle's velocity approaches
              the speed of light (time dilation due to the doppler effect).
            </li>
          </ul>
        </li>
        <li>
          “Energy”
          <ul>
            <li>
              Total magntiude of field within particle. To be clear, there are
              many forms of energy within the energetics framework, this
              “energy” refers to just one of them.
            </li>
          </ul>
        </li>
        <li>
          Anti-ness
          <ul>
            <li>
              Poorly defined. When the arc length is exactly 180° and the
              boundary is removed antiparticles behave identically to particles.
              So we should be able to get identical results by doing either of A
              or B: A) run a few steps, or B), take the reciprocal of all the
              vectors, run a few steps, take the recriprocal again. Pulling that
              thread should lead to an explicit definition of anti-ness.
            </li>
          </ul>
        </li>
      </ol>
      <p>
        I think it's exciting to see how many properties these simulated
        particles share with real-world particles. These similarities may be
        entirely superficial, but what if they aren't? It feels worthwhile to
        play pretend and explore the possible world where the simulation
        reflects true things about nature.
      </p>
      {/* <p>
        If you want to see more behaviour, then play around with the simulation.
        Like, removing the boundary and setting the arc length to exactly 180°
        makes antiparticles behave identically to particles. That's something
        you could try. There's a different kind of particle that starts showing
        up with an arc length of &gt;359.99°. Or maybe try an arc length of 1°
        or try making the boundary into a different shape. Anyway, moving on.
      </p> */}
      <h2>Play Pretend: Speculative Connections to The Real World</h2>
      <p style={{borderLeft: '4px solid #999', paddingLeft: 20}}>
        <strong>Note:</strong> Equivalents to real-world quantum phenomena can
        be observed in the simulation. However, they do not necessarily match-up
        with real-world physics. Any direct conclusions drawn from this
        simulation are very likely to be incorrect. This research is a
        preliminary exercise, it's purpose is to inspire ideas worth a closer
        look.
      </p>
      <p>
        This section is a work-in-progress and I haven't included it. For a
        preview, see{' '}
        <a href="/neutron-as-an-ecosystem">/neutron-as-an-ecosystem</a>.
      </p>
      <h2>Explanation: Why the Simulation Behaves As It Does</h2>
      <p>
        We observe that from random initial conditions the vector magnitudes all
        go lining up with each other, that there's a spontaneous decrease in
        disorder. We explain why this is possible in theory at{' '}
        <a href="/introduction">/introduction</a>, but not why it's likely in
        practice. The solution is quite straight-forward in the simulation at{' '}
        <a href="/particle-simulation">/particle-simulation</a>, we exploit
        inelasticity to (almost) directly control the rate at which disorder is
        created or destroyed. But there's no such direct control in this
        discrete field simulation. For this simulation the rate at which
        disorder is created and destroyed is instead determined by its emergent
        dynamics — let's unpack that.
      </p>
      <p>
        To start off, let's observe that when two flows collide they fuse into a
        single flow, undergoing compression, and then that single flow expands.
        Such that compression leads to expansion and vice versa. Such that they
        balance each other, and converge to an equilbrium where flows expand and
        compress in equal measure.
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{height: 192, padding: 10, border: '1px solid #ccc'}}
            alt="smooth_shear"
            src="/vector-field-txt/explanation_1.png"
          />
          <p>Expansion</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, height: 192, border: '1px solid #ccc'}}
            alt="rough_lines_1"
            src="/vector-field-txt/explanation_2.png"
          />
          <p>Compression</p>
        </span>
      </div>
      <p>
        Whereas expansion creates disorder, compression destroys it. And since
        flow tends to expand and compress in equal measure, disorder tends to
        being created and destroyed in equal measure. And so, the simulation
        minimises change in disorder over time, its “goal” is to conserve
        disorder. And funnily enough, the more disorder there is in a system,
        the more the amount of disorder will fluctuate. So the optimal way to
        conserve disorder is to minimise disorder. But how do we know disorder
        fluctuates more when disorder is high?
      </p>
      <p>
        Let's bring out a simplified version of our simulation, just two
        connected cells with a flow rate:
      </p>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div>
          <div style={{border: '1px solid #ccc', padding: 8}}>
            <ExplainerDiffusion />
          </div>
        </div>
      </div>
      <p style={{textAlign: 'center'}}>
        This is interactive btw,
        <br />
        so feel free to play around
      </p>
      <p>
        This simplified version gives us a window into chaos theory, for it is
        equivalent to the logistic map function, <Tex>{`f(x) = rx(1 - x)`}</Tex>
        , for r = 1 to 3, where <Tex>{`r`}</Tex> is proportional to flow, and{' '}
        <Tex>{`f(x)`}</Tex> is proportional to the magnitude of either cell,{' '}
        <Tex>{`x`}</Tex>, after one step. The logistic map can accurately model
        many things, including a heart attack. Let's look beyond r=3. At r=3.5
        the logistic map alternates between four values, like ba-dum ba-dum
        ba-dum, steadily and reliably. At r=3.6 the patient begins experiencing
        arrhythmia. At r=3.7 the patient's heart begins spasming uncontrollably
        and no longer pumps blood; at r=3.7, the onset of chaos, teensy changes
        to the value of <Tex>{`x`}</Tex> lead to large and unpredictable changes
        in <Tex>{`f^{\\circ 60}(x)`}</Tex>; the logistic map's behaviour has
        become highly disorderd. At r=3.75 the value of{' '}
        <Tex>{`f^{\\circ 60}(x)`}</Tex> becomes even more sensitive to{' '}
        <Tex>{`x`}</Tex>, and still more sensitive at r=3.80; the patient's odds
        of survival are plummeting. At r=3.85 is an island of stability, they
        are littered through the logistic map like prime numbers; within this
        island the value of <Tex>{`x`}</Tex> alternates between three values,
        there is very little disorder. The stars have aligned, a defibrillator
        shock applied to the patient's chest at r=3.85 has a good chance of
        bringing them back from the brink of death. A few moments later, at
        r=3.86, and the logistic map would go back to chaos. These islands of
        stability are what gave me the idea disorder fluctuates more when
        disorder is high. I think we can take the same logic that applies to the
        balance of magntiude between the two cells of the simplified simulation,
        and apply it to the balance of expansion vs compression in the full
        simulation.
      </p>
      <iframe
        title="logistic map function"
        src="https://www.desmos.com/calculator/e5jd7thipk?embed"
        width="100%"
        height="400"
        style={{border: 'solid 2px #ccc'}}
        frameBorder="0"
      ></iframe>
      <p style={{textAlign: 'center'}}>
        Interactive calculator:{' '}
        <a
          rel="noopener"
          target="_blank"
          href="https://www.desmos.com/calculator/e5jd7thipk"
        >
          desmos.com/calculator/e5jd7thipk
        </a>
        <br />
        Veritasium's intro to the logistic map:{' '}
        <a
          rel="noopener"
          target="_blank"
          href="https://youtube.com/watch?v=ovJcsL7vyrk"
        >
          youtube.com/watch?v=ovJcsL7vyrk
        </a>
      </p>
      <p>
        So what exactly is getting its disorder minimised? It's easy to simply
        say “the vectors” but we can do better than that. Let's talk about flow,
        signal, energy, and disorder. Consider three paths from A to B:
        {/*         
         Chaos theory tells us small changes to
        initial conditions can lead to large and unpredictable effects, such
        that the flap of a butterfly's wing in Tokyo may determine whether a
        hurricane hits New York. Which raises the question: Did the butterfly
        cause the hurricane? The answer: No. */}
      </p>
      <style>
        {`
          .path-table td {
            padding: 3px;
            border: 1px solid #ccc;
          }
        `}
      </style>
      <table
        style={{
          margin: '0 auto',
          tableLayout: 'fixed',
          borderCollapse: 'collapse',
          textAlign: 'center',
        }}
        className="path-table"
      >
        <thead style={{fontWeight: 'bold'}}>
          <tr>
            <td style={{width: 420}}>Path</td>
            <td style={{width: 60}}>Signal</td>
            <td style={{width: 60}}>Flow</td>
            <td style={{width: 60}}>Causal</td>
            <td style={{width: 80}}>Domain</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              The sequence of events between the flap of a butterfly's wing of
              the coast of Tokyo and a hurricane making landfall at New York
            </td>
            <td>No</td>
            <td>No</td>
            <td>No</td>
            <td>Chaotic</td>
          </tr>
          <tr>
            <td>
              The flow of nutrients from British farms to wild foxes, through an
              ensemble of several routes
            </td>
            <td>No</td>
            <td>Yes</td>
            <td>Yes*</td>
            <td>Complex</td>
          </tr>
          <tr>
            <td>
              A WhatsApp message travelling across the transatlantic cable that
              connects Spain and Virginia
            </td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Yes</td>
            <td>Classical</td>
          </tr>
        </tbody>
      </table>
      <p>
        Recalling our definition of disorder from{' '}
        <a href="/introduction">/introduction</a>, one may choose to describe
        how disordered these paths are in terms of how much information they
        contain (the length of the shortest possible description needed to
        exactly reproduce them). That works, but there's a better way to
        quantify disorder for paths—we can look at how predictable of an effect
        A has on B. We can measure that with either signal or flow.
      </p>
      <p>
        Signal refers to how accurately a message sent from A can be reproduced
        at B. The easier it is to predict the state of A given B, to reverse A ⇒
        B, the less disordered A ⇒ B is. One can learn more about signal by
        reading Claude Shannon's paper,{' '}
        <a
          rel="noopener"
          target="_blank"
          href="https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf"
        >
          A Mathematical Theory of Communication
        </a>
        , or by Googling for{' '}
        <a
          rel="noopener"
          target="_blank"
          href="https://www.google.com/search?q=information+theory"
        >
          “information theory”
        </a>{' '}
        (it should be called signal theory, but isn't). Flow refers to the
        transfer of energy from A to B; for example, if a fox ate a rabbit which
        ate a cabbage, we would say there was a flow of nutrients from the
        cabbage to the fox; but we wouldn't say there was any signal transferred
        from the cabbage to the fox, unless we could reproduce the consumed
        cabbage given the fox's current state. Anyway, all signals are made of
        both information (disorder) and redundant information (order), which we
        call energy when combined. If that energy gets all mixed-up on the
        journey from A to B, the signal gets destroyed but the flow doesn't. For
        more about flow see Robert Ulanowicz's book,{' '}
        <a
          rel="noopener"
          target="_blank"
          href="https://www.google.com/search?q=ecology+the+ascendent+perspective"
        >
          Ecology
        </a>
        .
      </p>
      <p>
        Whenever there's a flow A ⇒ B, we say A influenced B (the latin word,
        influentia, literally means “flows into”). Whenever there's a signal
        transfer A ⇒ B, we say A caused B, B happened be-<em>cause</em> A. When
        we refocus the discussion from “the vectors” to flow and signal, we
        switch from just talking about how the simulation behaves to talking
        about how everything happens, whether it's the flow of nutrients through
        an ecosystem, signals travelling across the internet, or whatever. We're
        talking about all influence and causation here.
      </p>
      <p>
        So the simulation minimises disorder in the paths energy travels along,
        the flow. By pulling it into the simplest possible shape: a circle /
        vortex. I find the evolutionary interpretation helps with the intuition
        for this. The flows all compete with one another, slowly converging
        towards optimal fitness; it's reproduction and variation whenever
        there's expansion and information is created; it's selection whenever
        there's compression and information is destroyed. The more energy
        travelling along a flow, the more successful it is. Closed path flows
        are more likely to be successful, are fitter, than open path flows,
        because closed path flows renew themselves; and without an energy source
        a flow will eventually fade to nothing. So that's why the particles are
        all vortices.
      </p>
      <p>
        Umm... so something something cycles are Lagrangian... competitive
        autocatalysis among energy cycles... and anyway, this all eventually
        builds up to a general model of causation and bieng, of how systems
        emerge and interact, and other such things. But I haven't had enough
        time to do all the work and write everything down. So we're going to
        abruptly end the essay here. Thank you for reading, check out my other
        work at <a href="/introduction">/introduction</a>, and see{' '}
        <a href="/roadmap">/roadmap</a> for a glimpse of what to expect in the
        future. If you want to say hi, email me at{' '}
        <a target="_blank" rel="noopener" href="mailto:me@ashtonsix.com">
          me@ashtonsix.com
        </a>
        .
      </p>
    </>
  )
}

export default ExplainerIntro
