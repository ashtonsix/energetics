import React from 'react'
import Tex from '../../Text/Tex'

const Labeled = ({label, children}) => (
  <span style={{display: 'block'}}>
    <span style={{display: 'inline-block', minWidth: 120, paddingRight: 8}}>
      {label}:
    </span>{' '}
    {children}
    <br />
  </span>
)

// stats,
// showBitsPolymorphismNote,
// MSTCompressionMetrics,
// let rows = [
//   // {
//   //   key: 'positionTheta',
//   //   label: MSTCompressionMetrics
//   //     ? `$\\text{minabs}(p_{0 \\theta}, p_{1 \\theta})$`
//   //     : `$p_{\\theta}$`,
//   // },
//   // MSTCompressionMetrics
//   //   ? {key: 'positionMagSubRadii', label: `$\\|p\\| - (r_0 + r_1)`}</Tex>
//   //   : {key: 'positionMag', label: `$\\|p\\|`}</Tex>,
//   // {key: 'velocityTheta', label: `$v_{\\theta}`}</Tex>,
//   // {key: 'velocityMag', label: `$\\|v\\|`}</Tex>,
//   // {key: 'radius', label: `$r`}</Tex>,
//   // {key: 'total', label: `total`},
//   {
//     key: 'positionTheta',
//     label: `position ( $\\theta$ )`,
//   },
//   {
//     key: MSTCompressionMetrics ? 'positionMagSubRadii' : 'positionMag',
//     label: `position ($\\|x\\|$)`,
//   },
//   {key: 'velocityTheta', label: `velocity ( $\\theta$ )`},
//   {key: 'velocityMag', label: `velocity ($\\|x\\|$)`},
//   {key: 'radius', label: `radius`},
//   {key: 'total', label: `total`},
// ]
// <Tex>{`\\text{minabs}(a, b) = a \\cdot [|a| \\le |b|] + b \\cdot [|a| > |b|]`}</Tex>{' '}
// (this is{' '}
// <a
//   rel="noopener"
//   target="_blank"
//   href="https://en.wikipedia.org/wiki/Iverson_bracket"
// >
//   Iverson bracket notation
// </a>
// )
// <Tex>{`\\text{bits}(x)`}</Tex> has two morphisms, the second morphism is{' '}
// <Tex>{`\\text{bits}(\\text{minabs}(a, b)) = \\text{bits}(x) + 1`}</Tex>

export const Explainer = () => {
  return (
    <div
      style={{
        maxWidth: 'calc(max(min(100vh, 100vw) - 65px, 500px))',
        fontSize: '18px',
      }}
    >
      <h1>Ashton's Particle Simulator: </h1>
      <h2>Ashton's Particle Simulator</h2>
      <p>
        In the sections that follow we will,{' '}
        <a href="#simulation-physics">one</a>, describe the physics of this
        simulation, and <a href="#inelasticity-thermodynamics">two</a>, discuss
        inelastic collision in the context of thermodynamics.
      </p>
      <h2 id="simulation-physics">Simulation Physics</h2>
      <p>
        This section exists primarily to share technical details regarding the
        software itself. If you are only interested in the emergent phenomena
        produced by the software you may wish to skip ahead to the{' '}
        <a href="#inelasticity-thermodynamic">section on thermodynamics</a>.
      </p>
      <p>The simulation consists of the following named parts:</p>
      <ol>
        <li>
          Boundary. A set of polygons that collides with particles
          <ul>
            <li>Most predefined boundaries have one polygon</li>
            <li>Most predefined polygons have 1000-ish vertices</li>
          </ul>
        </li>
        <li>
          Particles
          <ul>
            <li>Collides with boundary</li>
            <li>
              May collide with other particles ("Particle Collisions" setting)
            </li>
            <li>Follows straight line paths at constant velocity</li>
            <li>Change direction/velocity when they collide</li>
            <li>Momentum is conserved in every collision</li>
            <li>As a collection, has a mean mass of 1</li>
            <li>As a collection, has a mean momentum of 1</li>
            <li>
              If every particle has a mass of 1, then they have a mean velocity
              of 1
            </li>
            <li>
              Has the following attributes:
              <ul>
                <li>Position. Vector</li>
                <li>Velocity. Vector</li>
                <li>Radius. Scalar</li>
                <li>
                  Mass. Virtual attribute, derived from "Particle Mass Constant"
                  setting, radius, and{' '}
                  <Tex>{`\\frac{\\sum_{i=0}^n r_i^2}{n}`}</Tex> where{' '}
                  <Tex>{`r_i`}</Tex> is the radius of particle <Tex>{`i`}</Tex>
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          Settings
          <ul>
            <li>Particle Count. Scalar</li>
            <li>Particle Radius (min). Scalar</li>
            <li>Particle Radius (max). Scalar</li>
            <li>
              Particle Radius (distribution). Scalar
              <ul>
                <li>
                  UI only shows when{' '}
                  <Tex>{`\\text{min} \\cdot 1.5 < \\text{max}`}</Tex>, or value
                  changed by user input
                </li>
              </ul>
            </li>
            <li>Particle Mass Constant. Boolean</li>
            <li>
              Particle Velocity Constant. Boolean
              <ul>
                <li>
                  Three valid combinations of Particle Mass Constant & Particle
                  Velocity Constant:
                  <ol>
                    <li>
                      <Tex>{`\\text{True}, \\text{True}`}</Tex>
                    </li>
                    <li>
                      <Tex>{`\\text{True}, \\text{False}`}</Tex>
                    </li>
                    <li>
                      <Tex>{`\\text{False}, \\text{False}`}</Tex>
                    </li>
                  </ol>
                </li>
              </ul>
            </li>
            <li>Simulation Speed. Scalar</li>
            <li>Particle Collisions. Boolean</li>
            <li>Particle Elasticity. Scalar, between 0 and 2</li>
            <li>
              Boundary Elasticity. Boolean
              <ul>
                <li>
                  If <Tex>{`\\text{True}`}</Tex>, when a particle collides the
                  angle of reflection equals the angle of incidence
                </li>
                <li>
                  If <Tex>{`\\text{False}`}</Tex>, the angle of reflection will
                  be 90°
                </li>
                <li>
                  If <Tex>{`\\text{False}`}</Tex> and a particle collides with
                  two points on the boundary simultaneously, the angle of
                  reflection equals the angle of incidence to a synthetic point,
                  which is defined by having a normal that bisects the two
                  orignal point's normals. Without this rule, things get bad
                  funky when a particle falls into a deep crevice
                </li>
              </ul>
            </li>
            <li>Spawn Rate. Scalar</li>
            <li>
              Spawn Area. If marked as "Disabled" in UI, Radius and Rotation
              Spread are made bigger
              <ul>
                <li>Position. Vector</li>
                <li>Radius. Scalar</li>
                <li>Rotation. Scalar</li>
                <li>Rotation Spread. Scalar</li>
              </ul>
            </li>
          </ul>
        </li>
      </ol>
      <p>
        There's no UI for it, but the simulator can generate boundary polygons
        either by sampling a function or tracing a black & white image (with{' '}
        <a
          target="_blank"
          rel="noopener"
          href="http://potrace.sourceforge.net/"
        >
          potrace
        </a>
        ), here are some details on the predefined boundaries provided:
      </p>
      <ul>
        <li>
          Circle / Square, two parameters: <Tex>{`0 \\le p \\le 3`}</Tex> and{' '}
          <Tex>{`1 \\le \\text{squeeze} \\le 3`}</Tex>
          <ul>
            <li>
              <Tex>{`
              0 \\le t \\le 2\\pi
              \\left \\{\\begin{aligned}
                &x = \\text{sgn}(\\cos(t))(|\\cos(t)|)^p\\\\
                &y = \\text{sgn}(\\sin(t))(|\\sin(t)|)^p \\text{squeeze}^{-1}\\\\
              \\end{aligned}\\right.`}</Tex>
            </li>
            <li>
              Rotated by 45° and scaled by{' '}
              <Tex>{`\\frac{(0.5\\sqrt{2})^{1 / p}}{0.5\\sqrt{2}}`}</Tex> when{' '}
              <Tex>{`p \\gt 1`}</Tex>
            </li>
          </ul>
        </li>
        <li>
          Rectangle / Pill, two parameters: squeeze & corner radius
          <ul>
            <li>
              More commonly known as the{' '}
              <a
                target="_blank"
                rel="noopener"
                href="https://blogs.ams.org/visualinsight/2016/11/15/bunimovich-stadium/"
              >
                Stadium Billiard
              </a>
            </li>
          </ul>
        </li>
        <li>
          Star / Hexagon, three parameters: # of points, inner radius, inner
          point offset
        </li>
        <li>
          Wave, two parameters: <Tex>{`n`}</Tex> and <Tex>{`r`}</Tex>
          <ul>
            <li>
              It's the outline of a{' '}
              <a
                target="_blank"
                rel="noopener"
                href="https://www.geogebra.org/m/x7c5evay"
              >
                Vortex Ring
              </a>{' '}
              viewed from above
            </li>
          </ul>
        </li>
        <li>Doughnut, two parameters: offset and radius</li>
        <li>
          Mixed shapes
          <ul>
            <li>
              <a
                target="_blank"
                rel="noopener"
                href="https://www.pks.mpg.de/nonlinear-dynamics-and-time-series-analysis/visualization-of-dynamical-systems/introduction-to-dynamical-systems-using-billiards/"
              >
                Pin
              </a>
            </li>
            <li>Chaos Square</li>
            <li>Manta Ray</li>
            <li>Mandelbrot Bulb</li>
            <li>
              <a
                target="_blank"
                rel="noopener"
                href="http://www.scholarpedia.org/article/Dynamical_billiards"
              >
                Sinai Billiard
              </a>
            </li>
            <li>Modified Sinai Billiard</li>
            <li>
              Pipes, inspired by a{' '}
              <a
                target="_blank"
                rel="noopener"
                href="https://www.youtube.com/watch?v=UpHOkHxpTvQ"
              >
                video about sewers
              </a>
            </li>
            <li>Telsa Valve 1</li>
            <li>
              <a
                target="_blank"
                rel="noopener"
                href="https://fluidpowerjournal.com/teslas-conduit/"
              >
                Telsa Valve 2
              </a>
            </li>
            <li>Ashton's Valve</li>
            <li>Circle Maze</li>
            <li>
              Square Maze, mazes generated at{' '}
              <a
                target="_blank"
                rel="noopener"
                href="http://www.mazegenerator.net/"
              >
                mazegenerator.net
              </a>
            </li>
          </ul>
        </li>
        <li>
          Thermo Buster. Nice things about this include:
          <ul>
            <li>Works for a wide range of settings</li>
            <li>Setup is similar to Maxwell's Demon (familiar)</li>
            <li>
              Can do a double vortex when the seperator is removed (at 95%
              elasticity)
            </li>
          </ul>
        </li>
      </ul>
      <p>Each step, the simulation does the following tasks:</p>
      <ol>
        <li>Spawn & destroy particles</li>
        <li>Update settings & normalise particles</li>
        <li>Move the particles forward</li>
        <li>Boundary collisions</li>
        <li>Particle collisions</li>
      </ol>
      <p>
        Let's look at each of these tasks mathematically. Here's the syntax
        we'll use:
      </p>
      <div style={{paddingLeft: '2em'}}>
        <Labeled label="assertion">
          <Tex>{`=`}</Tex>
        </Labeled>
        <Labeled label="reassignment">
          <Tex>{`:=`}</Tex>
        </Labeled>
        <Labeled label="vector">
          <Tex>{`[v_x, v_y]`}</Tex>
        </Labeled>
        <Labeled label="normalisation">
          <Tex>{`\\overline{x}`}</Tex>
        </Labeled>
        <Labeled label="dot product">
          <Tex>{`x \\cdot y`}</Tex> (multiplication if one/both of{' '}
          <Tex>{`x`}</Tex> or <Tex>{`y`}</Tex> is scalar)
        </Labeled>
        <Labeled label="magnitude">
          <Tex>{`\\|x\\|`}</Tex>
        </Labeled>
        <Labeled label="absolute">
          <Tex>{`|x|`}</Tex>
        </Labeled>
        <Labeled label="mix">
          <Tex>{`\\text{mix}(a, b, 0 \\le m \\le 1) = a(1 - m) + bm`}</Tex>
        </Labeled>
        <Labeled label="sign">
          <Tex>{`\\text{sgn}(x) = 1\\text{ if }x \\ge 0\\text{ else } {-1}`}</Tex>
        </Labeled>
        <Labeled label="random">
          <Tex>{`(0 \\lt P(0, 1) \\lt 1) \\in \\mathbb{R}`}</Tex>
        </Labeled>
        <br />
        <Labeled label="position">
          <Tex>{`p`}</Tex>
        </Labeled>
        <Labeled label="velocity">
          <Tex>{`v`}</Tex>
        </Labeled>
        <Labeled label="radius">
          <Tex>{`r`}</Tex>
        </Labeled>
        <Labeled label="mass">
          <Tex>{`m`}</Tex>
        </Labeled>
        <Labeled label="momentum">
          <Tex>{`\\mathbf{p}`}</Tex>
        </Labeled>
        <Labeled label="velocity of particle 0">
          <Tex>{`v_0`}</Tex>
        </Labeled>
        <Labeled
          label={
            <>
              velocity of particle 0, projected onto{' '}
              <Tex>{`\\overline{n}`}</Tex>
            </>
          }
        >
          <Tex>{`v_{0n}`}</Tex>
        </Labeled>
      </div>
      <h4>Spawn & Destroy Particles</h4>
      <p>
        Particles are spawned / destroyed until the number of particles
        displayed on-screen equals{' '}
        <Tex>{`\\text{floor}(\\text{Particle Count})`}</Tex>. For a new
        particle:
      </p>
      <div style={{paddingLeft: '2em'}}>
        <Labeled label="spawn area">
          <Tex>{`S`}</Tex>
        </Labeled>
        <Labeled label="radius">
          <Tex>{`\\text{min}, \\text{max}, \\text{distribution}, \\frac{1}{6} \\lt \\text{distribution} \\lt 6`}</Tex>
        </Labeled>
      </div>
      <div style={{paddingLeft: '2em'}}>
        <Tex
          block
        >{`q_{rotation} = S_{rotation} + P(-1, 1) S_{rotationSpread}`}</Tex>
        <br />
        <br />
        <Tex block>{`q_{distance} = \\sqrt{P(0, 1)}S_{radius}`}</Tex>
        <br />
        <br />
        <Tex
          block
        >{`\\displaylines{p = S_{position} + [\\cos(q_{rotation}) q_{distance}, \\sin(q_{rotation}) q_{distance}],\\\\\\text{and if possible, does not collide with boundary}}`}</Tex>
        <br />
        <br />
        <Tex
          block
        >{`r = \\text{min} + (\\text{max} - \\text{min})P(0, 1)^{\\text{distribution}}`}</Tex>
        <br />
        <br />
        <Tex block>{`m = \\left \\{\\begin{aligned}
          &1, && \\text{if}\\ \\text{Particle Mass Constant} = \\text{True}\\\\
          &\\frac{\\pi r^2}{\\text{average area}}, && \\text{otherwise}
        \\end{aligned} \\right.`}</Tex>
        <br />
        <br />
        <Tex block>{`v = \\frac{1}{m}`}</Tex>
        <br />
        <br />
        <Tex block>{`\\mathbf{p} = 1`}</Tex>
      </div>
      <p>The choice of which particle(s) to destroy is random.</p>
      <h4>Update settings & normalise particles</h4>
      <p>
        Mass and momentum, both total and mean, are conserved, and their mean
        equals 1, so long as no settings are changed partway through an
        experiment and the spawn rate equals 0. When either of these predicates
        is broken we:
      </p>
      <ol>
        <li>
          Apply linear scaling to the mass to make the mean mass equal to 1
        </li>
        <li>
          Then, apply linear scaling to the velocity to make the mean momentum
          equal to 1
        </li>
      </ol>
      <p>
        Applying linear scaling to mass has no observable effect since this does
        not change the relative mass between any pair of particles, which is the
        thing that really matters.
      </p>
      <p>
        Applying linear scaling to velocity makes everything slow down / speed
        up. This has an effect when: one or more particles are destroyed, the
        particle mass setting is changed, any of the particle radius settings
        are changed. This scaling factor's value typically ranges from 98% to
        102%, and only causes a perceptible difference when the settings are
        changed many times over the course of an experiment.
      </p>
      <h4>Move the particles forward</h4>
      <p>For each particle:</p>
      <p style={{paddingLeft: '2em'}}>
        <Tex>{`p := p + v \\cdot \\text{simulation speed}`}</Tex>
      </p>
      <h4>Boundary Collisions</h4>
      For each particle, the simulator:
      <ol>
        <li>
          Collision Detection (A): Gets the closest point on the boundary
          (approximate)
        </li>
        <li>
          Collision Detection (B): Checks whether there's a collision with the
          boundary
        </li>
        <li>
          Collision Response (A): Translates the particle, so it does not
          overlap the boundary
        </li>
        <li>
          Collision Response (B): Updates the particle velocity, either bouncing
          off (elastic), or not (inelastic, sticks to boundary)
        </li>
      </ol>
      <p>
        As an aid to Collision Detection (A), there are regularly-spaced points
        across the entire simulation area, that are each associated with the
        closest point on the boundary. We generate these associations whenever
        the boundary shape is changed using a mixture of raycasting and
        breadth-first-search (takes about 400ms on my computer). These
        associations make it easy and fast to lookup the closest point on the
        boundary for each particle (I came up with this algorithm by myself,
        don't know if it's used elsewhere). Each point on the boundary consists
        of a position and a normal (inwards-pointing vector). The point
        associations are shown below at one sixteenth of the actual resolution
        (there's an additional finemesh that covers just the area close to the
        boundary, and improves the collision detection accuracy for spikey
        geometry):
      </p>
      <img
        alt="boundary"
        src="/explainer/boundary.jpg"
        style={{maxWidth: '100%'}}
        loading="lazy"
      />
      <br />
      <br />
      <div style={{paddingLeft: '2em'}}>
        <Labeled label="boundary point normal">
          <Tex>{`N`}</Tex>
        </Labeled>
        <Labeled label="boundary point tangent">
          <Tex>{`T`}</Tex>
        </Labeled>
        <Labeled label="boundary point position">
          <Tex>{`P`}</Tex>
        </Labeled>
        <Tex>{`T = [-N_y, N_x]`}</Tex>
        <br />
        <Tex>{`p_N = \\overline{N}(\\overline{N} \\cdot (p-P))`}</Tex>
        <br />
        <Tex>{`p_T = \\overline{T}(\\overline{T} \\cdot (p-P))`}</Tex>
      </div>
      <p>
        If <Tex>{`\\|p_N\\| \\le r`}</Tex> there is a collision, and we continue
        calculating. Otherwise, we skip ahead. That's Collision Detection (B).
      </p>
      <p>For Collision Response (A), translating the particle:</p>
      <p style={{paddingLeft: '2em'}}>
        <Tex>{`p_N := \\overline{N} r`}</Tex>
        <br />
        <Tex>{`p_T := \\overline{T} \\min(\\|p_T\\|, r)\\text{sgn}(T \\cdot p_T)`}</Tex>
        <br />
        <Tex>{`p := P + p_N + p_T`}</Tex>
      </p>
      <p>
        This translation moves <Tex>{`p`}</Tex>, so it is <Tex>{`r`}</Tex> away
        from the boundary, and no more than <Tex>{`r`}</Tex> off-to-the side
        (useful constraint for when the boundary changes shape via user input,
        and a particle gets buried deep inside the boundary).
      </p>
      <p>
        Moving on to Collision Response (B), we begin by getting the closest
        point on the boundary again, and checking for a collision once more. If
        there is a collision:
      </p>
      <p style={{paddingLeft: '2em'}}>
        <Tex>{`N\\text{ := }\\overline{\\text{mix}(\\overline{N_0}, \\overline{N_1}, 0.5)}`}</Tex>
        <br />
        <Tex>{`P\\text{ := }\\text{mix}(P_0, P_1, 0.5)`}</Tex>
        <br />
        <Tex>{`\\text{Translate the particle again, by repeating the above method}`}</Tex>
        <Tex>{`\\text{Collides With Two Points Simultaneously} = \\text{True}`}</Tex>
      </p>
      <p>
        We finish Collision Response (B) by updating the velocity (if elastic,
        the angle of reflection will equal angle of incidence; if inelastic, the
        angle of reflection will equal 90°):
      </p>
      <p style={{paddingLeft: '2em'}}>
        <Tex>{`
          v := \\left \\{\\begin{aligned}
            &v - 2\\overline{N}(\\overline{N} \\cdot v), && \\text{if}\\ \\text{Boundary Elasticity = True}\\\\
            &v - 2\\overline{N}(\\overline{N} \\cdot v), && \\text{if}\\ \\text{Collides With Two Points Simultaneously}\\\\
            &\\overline{T} \\|v\\| \\cdot \\text{sgn}(\\overline{T} \\cdot v), && \\text{otherwise}
          \\end{aligned} \\right.
        `}</Tex>
      </p>
      <h4>Particle Collisions</h4>
      <p>
        I made an interactive calculator for this bit, the full version is at:{' '}
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
        style={{border: 'solid 1px #ccc'}}
        frameBorder="0"
      ></iframe>
      <p>
        For each pair of overlapping particles (we use a{' '}
        <a
          target="_blank"
          rel="noopener"
          href="https://en.wikipedia.org/wiki/Cell_lists"
        >
          cell list
        </a>{' '}
        to help identify the pairs, which ended up about 4x faster than a
        quadtree-based approach when I compared them):
      </p>
      <p>Get the normal, tangent, and initial momentum</p>
      <p style={{paddingLeft: '2em'}}>
        <Tex block>{`n = p_0 - p_1`}</Tex>
        <br />
        <Tex block>{`t = [-n_y, n_x]`}</Tex>
        <br />
        <Tex block>{`\\mathbf{p}_{initial} = m_0\\|v_0\\| + m_1\\|v_1\\|`}</Tex>
      </p>
      <p>
        Translate the particles, pushing them apart until they no longer overlap
      </p>
      <p style={{paddingLeft: '2em'}}>
        <Tex>{`p_0 := p_0 + \\overline{n} \\dfrac{r_0 + r_1 - \\|n\\|}{2}`}</Tex>
        <br />
        <Tex>{`p_1 := p_1 - \\overline{n} \\dfrac{r_0 + r_1 - \\|n\\|}{2}`}</Tex>
      </p>
      <p>Project the velocities</p>{' '}
      <p style={{paddingLeft: '2em'}}>
        <Tex>{`v_{0n} = \\overline{n}(\\overline{n} \\cdot v_0)`}</Tex>
        <br />
        <Tex>{`v_{1n} = \\overline{n}(\\overline{n} \\cdot v_1)`}</Tex>
        <br />
        <Tex>{`v_{0t} = \\overline{t}(\\overline{t} \\cdot v_0)`}</Tex>
        <br />
        <Tex>{`v_{1t} = \\overline{t}(\\overline{t} \\cdot v_1)`}</Tex>
      </p>
      <p>
        Update the velocities
        <br />
        <Labeled label="Particle Elasticity">
          <Tex>{`E`}</Tex>
        </Labeled>
        If <Tex>{`E=1`}</Tex> and <Tex>{`m_0=m_1`}</Tex> this just swaps the
        value of <Tex>{`v_{0n}`}</Tex> & <Tex>{`v_{1n}`}</Tex>
        <br />
        If <Tex>{`m_0`}</Tex> is much larger than <Tex>{`m_1`}</Tex> then{' '}
        <Tex>{`v_{0n}`}</Tex> will change by a little and <Tex>{`v_{1n}`}</Tex>{' '}
        will change by a lot
      </p>
      <p style={{paddingLeft: '2em'}}>
        <Tex
          block
        >{`v_{0n} := \\frac{E m_1 (v_{1n} - v_{0n}) + m_0 v_{0n} + m_1 v_{1n}}{m_0 + m_1}, \\text{and simultaneously:}`}</Tex>
        <br />
        <br />
        <Tex
          block
        >{`v_{1n} := \\frac{E m_0 (v_{0n} - v_{1n}) + m_0 v_{0n} + m_1 v_{1n}}{m_0 + m_1}`}</Tex>
        <br />
        <br />
        <Tex block>{`v_0 := v_{0n} + v_{0t}`}</Tex>
        <br />
        <br />
        <Tex block>{`v_1 := v_{1n} + v_{1t}`}</Tex>
      </p>
      <p>Conserve kinetic energy</p>
      <p style={{paddingLeft: '2em'}}>
        <Tex block>{`\\mathbf{p}_{current} = m_0\\|v_0\\| + m_1\\|v_1\\|`}</Tex>
        <br />
        <br />
        <Tex
          block
        >{`v_0 := v_0\\frac{\\mathbf{p}_{initial}}{\\mathbf{p}_{current}}`}</Tex>
        <br />
        <br />
        <Tex
          block
        >{`v_1 := v_1\\frac{\\mathbf{p}_{initial}}{\\mathbf{p}_{current}}`}</Tex>
      </p>
      <p>Apply constant velocity</p>
      <p style={{paddingLeft: '2em'}}>
        <Tex>{`v_0 := \\left \\{\\begin{aligned}
          &\\overline{v_0}, && \\text{if}\\ \\text{Constant Velocity} = \\text{True}\\\\
          &v_0, && \\text{otherwise}
        \\end{aligned} \\right.`}</Tex>
        <br />
        <br />
        <Tex>{`v_1 := \\left \\{\\begin{aligned}
          &\\overline{v_1}, && \\text{if}\\ \\text{Constant Velocity} = \\text{True}\\\\
          &v_1, && \\text{otherwise}
        \\end{aligned} \\right.`}</Tex>
      </p>
      <h4>Done</h4>
      <p>
        We now update the display (using{' '}
        <a target="_blank" rel="noopener" href="https://www.pixijs.com">
          PixiJS
        </a>
        ) and move onto the next step, repeating all the tasks again.
      </p>
    </div>
  )
}

export default Explainer
