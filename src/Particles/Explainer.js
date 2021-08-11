import React from 'react'
import useMathjax from './useMathjax'
import AnalysisDisplayTable from './analysis/AnalysisDisplayTable'

export const ExplainerIntro = () => {
  return (
    <>
      <p>
        This is Ashton's particle simulator. It is part of my larger
        investigation into how social systems emerge from physical systems (from
        atoms to justice, from molecules to mercy), and into the commonalities
        shared between social and physical systems. Inspirations for my approach
        include theoretical ecology and daoist philosophy.
      </p>
      <p>
        I designed this simulator for the purpose of exploring inelastic
        collisions. They are interesting because inelastic collisions can create
        correlations between particle trajectories, the same way that
        conversation (collisions between people) can create commonalities
        between people. In the real-world an inelastic collision will always
        convert some kinetic energy into thermal energy, increasing a system's
        disorder and inability to do work, more than compensating for any newly
        created correlations. But in this simulation the kinetic energy is
        always conserved. This twist on inelastic collision allows particles to
        move in a way that violates the second law of thermodynamics, in
        essence, to spontaneously flow from places where pressure is low to
        places where it is high.
      </p>
      <p style={{fontSize: '0.96em'}}>
        <strong>Figure:</strong> Different kinds of collision
      </p>
      <p style={{fontSize: '0.96em'}}>
        <strong>Figure:</strong> Progression of different inelastic collision
        experiments, starting from random initial states
      </p>
      <img
        alt="experiments"
        src="/explainer/inelastic.jpg"
        style={{maxWidth: '100%'}}
        loading="lazy"
      />
      <p>
        Although this simulator was designed for exploring inelastic collisions
        it is also a general-purpose particle simulator. I encourage you to play
        around and try things, if you're not sure where to start try replicating
        this figure and go from there:
      </p>
      <p style={{fontSize: '0.96em'}}>
        <strong>Figure:</strong> Dynamical billiards
      </p>
      <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
        <img
          alt="circle arena"
          src="/explainer/billiards_circle.png"
          style={{maxWidth: 'min(270px, 30%)'}}
          loading="lazy"
        />
        <img
          alt="sinai arena"
          src="/explainer/billiards_sinai.png"
          style={{maxWidth: 'min(270px, 30%)'}}
          loading="lazy"
        />
        <img
          alt="maze arena"
          src="/explainer/billiards_maze.png"
          style={{maxWidth: 'min(270px, 30%)'}}
          loading="lazy"
        />
      </div>
    </>
  )
}

const Definition = ({label, math}) => (
  <span style={{display: 'block'}}>
    <span style={{display: 'inline-block', minWidth: 120, paddingRight: 8}}>
      {label}:
    </span>
    {' $ ' + math + ' $'}
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
//   //   ? {key: 'positionMagSubRadii', label: `$\\|p\\| - (r_0 + r_1)$`}
//   //   : {key: 'positionMag', label: `$\\|p\\|$`},
//   // {key: 'velocityTheta', label: `$v_{\\theta}$`},
//   // {key: 'velocityMag', label: `$\\|v\\|$`},
//   // {key: 'radius', label: `$r$`},
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
// {`$\\text{minabs}(a, b) = a \\cdot [|a| \\le |b|] + b \\cdot [|a| > |b|]$`}{' '}
// (this is{' '}
// <a
//   rel="noreferrer"
//   target="_blank"
//   href="https://en.wikipedia.org/wiki/Iverson_bracket"
// >
//   Iverson bracket notation
// </a>
// )
// {`$\\text{bits}(x)$`} has two morphisms, the second morphism is{' '}
// {`$\\text{bits}(\\text{minabs}(a, b)) = \\text{bits}(x) + 1$`}

export const Explainer = () => {
  useMathjax()

  return (
    <div
      style={{
        maxWidth: 'calc(max(min(100vh, 100vw) - 65px, 500px))',
        fontSize: '18px',
      }}
    >
      <h2>Ashton's Particle Simulator</h2>
      <ExplainerIntro />
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
                  setting, radius, and {'$\\frac{\\sum_{i=0}^n r_i^2}{n}$'}{' '}
                  where {'$r_i$'} is the radius of particle {'$i$'}
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
                  UI only shows when {'$\\text{min} \\cdot 1.5 < \\text{max}$'},
                  or value changed by user input
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
                    <li>{`$\\text{True}, \\text{True}$`}</li>
                    <li>{`$\\text{True}, \\text{False}$`}</li>
                    <li>{`$\\text{False}, \\text{False}$`}</li>
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
                  If {`$\\text{True}$`}, when a particle collides the angle of
                  reflection equals the angle of incidence
                </li>
                <li>
                  If {`$\\text{False}$`}, the angle of reflection will be 90°
                </li>
                <li>
                  If {`$\\text{False}$`} and a particle collides with two points
                  on the boundary simultaneously, the angle of reflection equals
                  the angle of incidence to a synthetic point, which is defined
                  by having a normal that bisects the two orignal point's
                  normals. Without this rule, things get bad funky when a
                  particle falls into a deep crevice
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
          rel="noreferrer"
          href="http://potrace.sourceforge.net/"
        >
          potrace
        </a>
        ), here are some details on the predefined boundaries provided:
      </p>
      <ul>
        <li>
          Circle / Square, two parameters: {'$0 \\le p \\le 3$'} and{' '}
          {'$1 \\le \\text{squeeze} \\le 3$'}
          <ul>
            <li>
              {`$
              0 \\le t \\le 2\\pi
              \\left \\{\\begin{aligned}
                &x = \\text{sgn}(\\cos(t))(|\\cos(t)|)^p\\\\
                &y = \\text{sgn}(\\sin(t))(|\\sin(t)|)^p \\text{squeeze}^{-1}\\\\
              \\end{aligned}\\right.$`}
            </li>
            <li>
              Rotated by 45° and scaled by{' '}
              {`$\\frac{(0.5\\sqrt{2})^{\\frac{1}{p}}}{0.5\\sqrt{2}}$`} when{' '}
              {'$p \\gt 1$'}
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
                rel="noreferrer"
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
          Wave, two parameters: {'$n$'} and {'$r$'}
          <ul>
            <li>
              It's the outline of a{' '}
              <a
                target="_blank"
                rel="noreferrer"
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
                rel="noreferrer"
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
                rel="noreferrer"
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
                rel="noreferrer"
                href="https://www.youtube.com/watch?v=UpHOkHxpTvQ"
              >
                video about sewers
              </a>
            </li>
            <li>Telsa Valve 1</li>
            <li>
              <a
                target="_blank"
                rel="noreferrer"
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
                rel="noreferrer"
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
      <p>Each step the simulation does the following tasks:</p>
      <ol>
        <li>Spawn & destroy particles</li>
        <li>Update settings & normalise particles</li>
        <li>Move the particles forward</li>
        <li>Boundary collisions</li>
        <li>Particle collisions</li>
      </ol>
      <p>
        Let's look at each of these in detail. Here are the math definitions:
      </p>
      <div style={{paddingLeft: '2em'}}>
        <Definition label="assertion" math={`=`} />
        <Definition label="reassignment" math={`:=`} />
        <Definition label="normalisation" math={`\\overline{x}`} />
        <Definition
          label="dot product"
          math={`x \\cdot y$ (multiplication if one/both of $x$ or $y$ is scalar)$`}
        />
        <Definition label="magnitude" math={`\\|x\\|`} />
        <Definition label="absolute" math={`|x|`} />
        <Definition
          label="mix"
          math={`\\text{mix}(a, b, m) = a(1 - m) + bm, 0 \\le m \\le 1`}
        />
        <Definition
          label="sign"
          math={`
          \\text{sgn}(x) =
          \\left \\{\\begin{aligned}
            &1, && \\text{if}\\ x \\ge 0\\\\
            &{-1}, && \\text{otherwise}
          \\end{aligned} \\right.
        `}
        />
        <Definition
          label="random number"
          math={`P(0, 1), P(0, 1) \\in \\mathbb{R}, 0 \\lt P(0, 1) \\lt 1`}
        />
        <br />
        <Definition label="position" math={`p`} />
        <Definition label="velocity" math={`v`} />
        <Definition label="radius" math={`r`} />
        <Definition label="mass" math={`m`} />
        <Definition label="momentum" math={`\\mathbf{p}`} />
        <Definition label="velocity of particle 0" math={`v_0`} />
        <Definition
          label={`velocity of particle 0, projected onto $\\overline{n}$`}
          math={`v_{0n}`}
        />
      </div>
      <h4>Spawn & Destroy Particles</h4>
      <p>
        Particles are spawned / destroyed until the number of particles
        displayed on-screen equals {`$\\text{floor}(\\text{Particle Count})$`}.
        Newly created particles have a momentum of 1. For a new particle:
      </p>
      <div style={{paddingLeft: '2em'}}>
        <Definition label="spawn area" math={`S`} />
        <Definition
          label="radius settings"
          math={`\\text{min}, \\text{max}, \\text{distribution}, \\frac{1}{6} \\lt \\text{distribution} \\lt 6`}
        />
      </div>
      <div>{`
        $$q_{rotation} = S_{rotation} + P(-1, 1) S_{rotationSpread}$$
        $$q_{distance} = \\sqrt{P(0, 1)}S_{radius}$$
        $$\\displaylines{p = S_{position} + [\\cos(q_{rotation}) q_{distance}, \\sin(q_{rotation}) q_{distance}],\\\\\\text{and if possible, does not collide with boundary}}$$
        $$r = \\text{min} + (\\text{max} - \\text{min})P(0, 1)^{\\text{distribution}}$$
        $$m = \\left \\{\\begin{aligned}
          &1, && \\text{if}\\ \\text{Particle Mass Constant} = \\text{True}\\\\
          &\\frac{\\pi r^2}{\\text{average area}}, && \\text{otherwise}
        \\end{aligned} \\right.$$
        $$v = \\frac{1}{m}$$
      `}</div>
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
      <p>{`$$
        p := p + v \\cdot \\text{simulation speed}
      $$`}</p>
      <h4>Boundary Collisions</h4>
      For each particle, the simulator:
      <ol>
        <li>Gets the closest point on the boundary (approximate)</li>
        <li>Checks whether there's a collision with the boundary</li>
        <li>Translates the particle, so it does not overlap the boundary</li>
        <li>Updates the particle velocity</li>
      </ol>
      <p>
        There are regularly-spaced points across the entire simulation area,
        that are each associated with the closest point on the boundary. We
        generate these associations whenever the boundary shape is changed using
        a mixture of raycasting and breadth-first-search (takes about 400ms on
        my computer). These associations make it easy and fast to lookup the
        closest point on the boundary for each particle (maybe an original
        algorithm, I came up with it by myself). Each point on the boundary
        consists of a position and a normal (inwards-pointing vector). The point
        associations are shown below at one sixteenth of the actual resolution:
      </p>
      <img
        alt="experiments"
        src="/explainer/boundary.jpg"
        style={{maxWidth: '100%'}}
        loading="lazy"
      />
      <br />
      <br />
      <div style={{paddingLeft: '2em'}}>
        <Definition label="boundary point normal" math={`N`} />
        <Definition label="boundary point tangent" math={`T`} />
        <Definition label="boundary point position" math={`P`} />
        {`$T = [-N_y, N_x]$`}
        <br />
        {`$p_N = \\overline{N}(\\overline{N} \\cdot (p-P))$`}
        <br />
        {`$p_T = \\overline{T}(\\overline{T} \\cdot (p-P))$`}
      </div>
      <p>
        If {`$\\|p_N\\| \\le r$`} there is a collision, and we continue
        calculating. Otherwise, we skip ahead.
      </p>
      <p>To translate the particle:</p>
      <p style={{paddingLeft: '2em'}}>
        {`$p_N := \\overline{N} r$`}
        <br />
        {`$p_T := \\overline{T} \\min(\\|p_T\\|, r)\\text{sgn}(T \\cdot p_T)$`}
        <br />
        {`$p := P + p_N + p_T$`}
      </p>
      <p>
        This translation moves {`$p$`}, so it is {`$r$`} away from the boundary,
        and no more than {`$r$`} off-to-the side (useful constraint for when the
        boundary changes shape via user input, and a particle gets buried deep
        inside the boundary).
      </p>
      <p>
        Get the closest point on the boundary again, and check for a collision.
        If there is a collision:
      </p>
      <p style={{paddingLeft: '2em'}}>
        {`$N := \\overline{\\text{mix}(\\overline{N_0}, \\overline{N_1}, 0.5)}$`}
        <br />
        {`$P := \\text{mix}(P_0, P_1, 0.5)$`}
        <br />
        {`$\\text{Translate the particle again, by repeating the above method}$`}
        {`$\\text{Collides With Two Points Simultaneously} = \\text{True}$`}
      </p>
      <p>
        To update the velocity (if elastic, angle of reflection will equal angle
        of incidence [bounce away]; if inelastic, angle of reflection will equal
        90° [stick to boundary]):
      </p>
      <p>{`$$
        v := \\left \\{\\begin{aligned}
          &v - 2\\overline{N}(\\overline{N} \\cdot v), && \\text{if}\\ \\text{Boundary Elasticity = True}\\\\
          &v - 2\\overline{N}(\\overline{N} \\cdot v), && \\text{if}\\ \\text{Collides With Two Points Simultaneously}\\\\
          &\\overline{T} \\|v\\| \\cdot \\text{sgn}(\\overline{T} \\cdot v), && \\text{otherwise}
        \\end{aligned} \\right.
      $$`}</p>
      <h4>Particle Collisions</h4>
      <p>
        I made an interactive calculator for this bit, the full version is at:{' '}
        <a
          href="https://www.desmos.com/calculator/dqn7twxcml"
          target="_blank"
          rel="noreferrer"
        >
          www.desmos.com/calculator/dqn7twxcml
        </a>
      </p>
      <iframe
        title="particle collision"
        src="https://www.desmos.com/calculator/dqn7twxcml?embed"
        width="100%"
        height="500"
        style={{border: 'solid 1px #ccc'}}
        frameBorder="0"
      ></iframe>
      <p>
        For each pair of overlapping particles (we use a{' '}
        <a
          target="_blank"
          rel="noreferrer"
          href="https://en.wikipedia.org/wiki/Cell_lists"
        >
          cell list
        </a>{' '}
        to help identify the pairs, which ended up about 4x faster than a
        quadtree-based approach when I compared them):
      </p>
      <p>Get the normal, tangent, and initial momentum</p>
      <p style={{paddingLeft: '2em'}}>
        {`$n = p_0 - p_1$`}
        <br />
        {`$t = [-n_y, n_x]$`}
        <br />
        {`$\\mathbf{p}_{initial} = m_0\\|v_0\\| + m_1\\|v_1\\|$`}
      </p>
      <p>
        Translate the particles, pushing them apart until they no longer overlap
      </p>
      <p>{`
        $$p_0 := p_0 + \\overline{n} \\dfrac{r_0 + r_1 - \\|n\\|}{2}$$ 
        $$p_1 := p_1 - \\overline{n} \\dfrac{r_0 + r_1 - \\|n\\|}{2}$$ 
        `}</p>
      <p>Project the velocities</p>
      <p style={{paddingLeft: '2em'}}>
        {`$v_{0n} = \\overline{n}(\\overline{n} \\cdot v_0)$`}
        <br />
        {`$v_{1n} = \\overline{n}(\\overline{n} \\cdot v_1)$`}
        <br />
        {`$v_{0t} = \\overline{t}(\\overline{t} \\cdot v_0)$`}
        <br />
        {`$v_{1t} = \\overline{t}(\\overline{t} \\cdot v_1)$`}
      </p>
      <p>
        Update the velocities
        <br />
        <Definition label="Particle Elasticity" math={`E`} />
        If {'$E=1$'} and {'$m_0=m_1$'} this just swaps the value of {'$v_{0n}$'}{' '}
        & {'$v_{1n}$'}
        <br />
        If {`$m_0$`} is much larger than {`$m_1$`} then {`$v_{0n}$`} will change
        by a little and {`$v_{1n}$`} will change by a lot
      </p>
      <p>{`
        $$v_{0n} := \\frac{E m_1 (v_{1n} - v_{0n}) + m_0 v_{0n} + m_1 v_{1n}}{m_0 + m_1}, \\text{and simultaneously:}$$
        $$v_{1n} := \\frac{E m_0 (v_{0n} - v_{1n}) + m_0 v_{0n} + m_1 v_{1n}}{m_0 + m_1}$$
        $$v_0 := v_{0n} + v_{0t}$$
        $$v_1 := v_{1n} + v_{1t}$$
      `}</p>
      <p>Conserve kinetic energy</p>
      <p>{`
        $$\\mathbf{p}_{current} = m_0\\|v_0\\| + m_1\\|v_1\\|$$
        $$v_0 := v_0\\frac{\\mathbf{p}_{initial}}{\\mathbf{p}_{current}}$$
        $$v_1 := v_1\\frac{\\mathbf{p}_{initial}}{\\mathbf{p}_{current}}$$
      `}</p>
      <p>Apply constant velocity</p>
      <p>{`
        $$v_0 := \\left \\{\\begin{aligned}
          &\\overline{v_0}, && \\text{if}\\ \\text{Constant Velocity} = \\text{True}\\\\
          &v_0, && \\text{otherwise}
        \\end{aligned} \\right.$$
        $$v_1 := \\left \\{\\begin{aligned}
          &\\overline{v_1}, && \\text{if}\\ \\text{Constant Velocity} = \\text{True}\\\\
          &v_1, && \\text{otherwise}
        \\end{aligned} \\right.$$
      `}</p>
      <h4>Done</h4>
      <p>
        We now update the display (using{' '}
        <a target="_blank" rel="noreferrer" href="https://www.pixijs.com">
          PixiJS
        </a>
        ) and move onto the next step, repeating all the tasks again.
      </p>
      <h2 id="inelasticity-thermodynamics">
        Inelastic Collisions and Thermodynamics
      </h2>
      <p>
        Energy itself is not the source of life. The true source of life is the
        movement of energy, the flow from places where it is hot to those where
        it is cold—a difference in energy. And it is said, that with every
        breath we inch closer to ultimate death—universal room temperature.
        Absolute stillness. To create a device that can unmix hot and cold is to
        save the universe, and what we shall endeavour to do here.
      </p>
      <p>
        When energy is all mixed-up we say it's in a state of <i>disorder</i>.
        Using a littany of definitions for our conceptual tools gives us more
        ways of seeing the challenges before us, so let's look at how a few
        notable scholars may potentially define disorder:
      </p>
      <ol>
        <li>
          Andrey Kolgomorov — the length of the shortest description that can
          exactly reproduce a system
        </li>
        <li>
          Claude Shannon — the inability to transmit a signal between two
          elements in a system
        </li>
        <li>
          Ludwig Boltzmann — the number of likely states a system may exist in
        </li>
        <li>
          Andrey Markov — the inability to predict what will happen next in a
          system
        </li>
        <li>
          Edward Lorenz — the number of attractors in a system's phase space
        </li>
        <li>Robert May — the growth factor of the variables in a system</li>
        <li>Alicia Juarrero — the lack of constraints in a system</li>
      </ol>
      <p>Let's see how these definitions stack-up against a few examples.</p>
      <p style={{fontWeight: 'bold'}}>Example 1: text</p>
      <p style={{fontWeight: 'bold'}}>
        "la la la la la la la la" vs. "qfqqocnobgqmdyhw"
      </p>
      <p>
        Kolgomorov. <i>"la la la la la la la la"</i> is less disorderd than{' '}
        <i>"qfqqocnobgqmdyhw"</i> because its shortest possible representation (
        <i>"la " * 8</i> ) is shorter than <i>"qfqqocnobgqmdyhw"</i> (which
        cannot be compressed at all).
      </p>
      <p>
        Shannon. If a messenger were asked to pass along two messages,{' '}
        <i>"la la la la la la la la"</i> and
        <i>"qfqqocnobgqmdyhw"</i>, they would probably pass along{' '}
        <i>"la la la la la la la la"</i> more accurately (because it's easier to
        remember), so it's therefore less disordered. This definition involves
        both the message and messenger.
      </p>
      <p>
        Boltzmann. Given that Ashton decided to provide two sequences: 1) an
        English phoneme repeated 8 times, and 2), a string 16 random alphabet
        letters, how many unique possibilities are there for each? Sequence 1
        has just 42 unique possibilities (eg, "ba ba ba ba ba ba ba ba").
        Whereas sequence 2 has {`$26^{16}$`} possibilities, a much bigger
        number, and therefore sequence 1 is less disordered.
      </p>
      <p>
        Markov. Someone has a near-100% chance of correctly predicting what
        comes next in the sequence <i>"la la la la la la la la"</i> and about a
        1 in 26 chance of predicting what comes next in the sequence{' '}
        <i>"qfqqocnobgqmdyhw"</i>, so <i>"la la la la la la la la"</i> is less
        disordered.
      </p>
      <p>
        Lorenz. Ashton stayed in just one place ("la") as she wrote{' '}
        <i>"la la la la la la la la"</i>, but moved about 26 different places as
        she wrote <i>"qfqqocnobgqmdyhw"</i>, so <i>"la la la la la la la la"</i>{' '}
        is less disordered.
      </p>
      <p>
        May. There is 0 difference between "la" and "la", and 1 unit of
        difference between "qm" and "dy". The rate of change through the
        sequence <i>"la la la la la la la la"</i> is therefore 0, and the rate
        of change through <i>"qfqqocnobgqmdyhw"</i> is 1, so{' '}
        <i>"la la la la la la la la"</i> is less disordered.
      </p>
      <p>
        Juarrero. Out of all the things that could go in a sequence: colours,
        numbers, etc. Ashton eliminated all but lowercase letters from the
        English alphabet. And ultimately, <i>"la la la la la la la la"</i> has
        more constraints on what can be included in the sequence than{' '}
        <i>"qfqqocnobgqmdyhw"</i>, so it is less disordered.
      </p>
      <p>
        Over the course of the experiment entropy decreases to it's minimum, but
        what exactly is entropy? each interaction between particles increase the
        similarity their trajectories, and these simularities accumulate, so{' '}
      </p>
      <p style={{fontWeight: 'bold'}}>Example 2: images</p>
      <p style={{fontWeight: 'bold'}}>
        <img
          alt="simple squares"
          src="/explainer/disorder_0.png"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />{' '}
        vs.{' '}
        <img
          alt="chaotic noise"
          src="/explainer/disorder_1.bmp"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />
      </p>
      <p>
        Kolgomorov. After trying to get the filesize of each image as small as
        possible,{' '}
        <img
          alt="simple squares"
          src="/explainer/disorder_0.png"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />{' '}
        came out as 107 bytes, and{' '}
        <img
          alt="simple squares"
          src="/explainer/disorder_1.bmp"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />{' '}
        came out as 2,112 bytes, so{' '}
        <img
          alt="simple squares"
          src="/explainer/disorder_0.png"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />{' '}
        is less disordered. With an inexact but similar reproduction of{' '}
        <img
          alt="simple squares"
          src="/explainer/disorder_1.bmp"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />
        , like this:{' '}
        <img
          alt="simple squares"
          src="/explainer/disorder_1.jpg"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />
        , we can reduce the filesize down to 318 bytes, but that is still more
        than 107 bytes.
      </p>
      <br />
      <p>
        Shannon. As a message: which can be transmitted more accurately? As an
        environment: A small square was added to each image, how accurately
        could someone identify the colour and location of the small square?{' '}
        <img
          alt="simple squares"
          src="/explainer/disorder_2.png"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />{' '}
        vs.{' '}
        <img
          alt="simple squares"
          src="/explainer/disorder_3.bmp"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />
      </p>
      <p>
        Boltzmann. Given all the possible images, how many are there with 2
        blocks of colour side-by-side vs how many are there with random values
        for every pixel?
      </p>
      <p>
        Markov. Start at one pixel, look at the colour, how accurately can
        someone predict the colour of a neighbouring pixel without looking at
        it?
      </p>
      <p>
        Lorenz. Starting from a randomly selected pixel, move one pixel towards
        the top-left if that top-left pixel is the same colour or darker than
        the starting pixel. Keep repeating. How many final destinations
        (attractors) are there for each image?
      </p>
      <p>
        May. How much does the value of the pixel change on average as you move
        from one pixel to another pixel next to it?
      </p>
      <p>
        Juarrero. What constrains the colour of each pixel? And which image has
        more constraints on pixel values?
      </p>
      <p style={{fontWeight: 'bold'}}>Example 3: downhill slopes</p>
      <p style={{fontWeight: 'bold'}}>
        <img
          alt="rough slope"
          src="/explainer/slope_0.png"
          loading="lazy"
          style={{height: 120}}
        />{' '}
        vs.{' '}
        <img
          alt="smooth slope"
          src="/explainer/slope_1.png"
          loading="lazy"
          style={{height: 120}}
        />
        <br />
        Let's push a ball down a slope, where will it end given a known slope
        shape but unknown friction coefficient? Let's compare the red (rough)
        slope with the blue (smooth) slope.
      </p>
      <p>
        Kolgomorov. 3 bits of information are needed to identify which of the 8
        potential resting places the ball lands at for the red slope. 1 bit is
        enough to identify the 1 potential resting place for the blue slope.
      </p>
      <p>
        Shannon. If the ball contains a message inside, and there's a person at
        the bottom of each slope waiting for that message, which person has a
        better chance of recieving that message?
      </p>
      <p>Boltzmann. 8 possibilities vs 1 possibility.</p>
      <p>
        Markov. We only have a 1 in 8 chance of correctly predicting where the
        ball go with the rough slope.
      </p>
      <p>Lorenz. 8 attractors vs 1 attractor.</p>
      <p>
        May. The second derivative of the ball's position (acceleration) has a
        greater growth rate for the rough slope.
      </p>
      <p>
        Juarrero. Most possibilities for the ball's final resting place are
        eliminated when we have a smooth slope.
      </p>
      <p style={{fontWeight: 'bold'}}>Example 4: focus</p>
      <p style={{fontWeight: 'bold'}}>
        <img
          alt="essentialism"
          src="https://miro.medium.com/max/467/1*nb6oufUkVJI9Mzk6tWUw2w.png"
          style={{maxHeight: 200}}
        />
        <br />
        Figure adapted from essentialism
      </p>
      <p>Kolgomorov.</p>
      <p>Shannon.</p>
      <p>Boltzmann.</p>
      <p>Markov.</p>
      <p>Lorenz.</p>
      <p>May.</p>
      <p>Juarrero.</p>
      <h4 style={{fontSize: '1.5em'}}>Final Example: particles</h4>
      <p>
        Let's dig into the minimal and maximal disorder modes for circle-shaped
        boundaries.
      </p>
      <img
        alt="experiments"
        src="/explainer/thermodynamics_1.jpg"
        style={{maxWidth: '100%'}}
        loading="lazy"
      />
      <p>
        Experimentally, we have seen that elastic collisions lead the particles
        towards maximum disorder, and inelastic collisions lead to minimal
        disorder. Let's use our seven definitions of disorder to explore what
        that means, as an aid to that exploration, here's a statistical
        breakdown of the particle's positions in the maximal and minimal
        disorder modes:
      </p>
      <img
        alt="experiments"
        src="/explainer/disorder_stats.png"
        style={{maxWidth: '100%'}}
        loading="lazy"
      />
      <p>
        At minimal disorder, it's easy to predict the orientation of any given
        particle given information about its neighbours (Markov), because each
        particle occupies such a narrow range of possibilities (Boltzmann); they
        occupy such a narrow band of orientations because whenever a particle
        deviates from that narrow band, its neighbouring particles act as an
        error-correcting system of interlocking constraints (Juarrero); we could
        say that these deviations have a growth rate &lt;1 (May). If some
        kinetic energy were added to just one particle that would create a
        shockwave that travels through the whole collection of particles, and
        could be interpreted as a signal (Shannon); at maximal disorder that
        shockwave would be dissipated very quickly, so the ratio of
        signal-to-noise would be lower than at minimal disorder.
      </p>
      <p>
        Let's imagine the 1D phase space for the orientation of particles
        relative to the boundary, which captures how the system as a whole will
        evolve. Given a random initial state and inelastic collisions the phase
        space will have two minimums, representing the equally likely
        possibilities of evolving into either a clockwise or anti-clockwise
        vortex; at minimal disorder there will be one minimum, representing the
        impossibility of a clockwise vortex spontaenously becoming an
        anti-clockwise vortex and vice versa. At maximum disorder the phase
        space will be flat and have infinite minimums, indicating the presence
        of chaos. (Lorenz). There are some boundary shapes (eg,{' '}
        <img
          alt="simple squares"
          src="/explainer/lorenz_pressure.jpg"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />
        ) where the particles can spontaneously reverse their net orientation at
        low particle pressure, but the circle isn't one of them.
      </p>
      <p>
        If we wanted to save the simulation state as the smallest possible file
        we could make a function that generates the approximate state given a
        negible amount of information, and then record just the adjustments
        needed to transform that approximate state into an exact reconstruction
        (Kolmogorov); with this technique the minimally disorderd particles
        would have a smaller file size eg, if a particle's exact orientation
        differs from the approximate orientation by at most 10° (as opposed to
        360°), then we can save {`$\\log_2(\\frac{360}{10})$`}, or 5.17, bits
        per particle on storage for their orientation without losing precision.
      </p>
      <p>
        Working with all of these definitions is a lot like Sudoku. A
        partially-understood phenomena is like a grid with just a few starting
        numbers written in, and the more definitions you have, the more numbers
        you start with, and the bigger the grid. By cross-referencing the
        numbers you can fill-in missing details, and identify mistakes /
        misunderstandings by looking for incompatibilities between the different
        interpretations.
      </p>
      <p>
        When we say "minimal disorder", we mean "minimal disorder given the
        situation". If we imagine the ideal situation for minimising disorder,
        then at that minimum every particle would share the same position,
        velocity, radius and mass. However, that isn't possible because the
        particles exclude each other, preventing overlaps. In the next-best
        scenario, the particles arrange themselves into an evenly-spaced grid
        (preferably hexagonal, for the aesthetics) and all share an orientation
        and velocity, in essence, every trajectory would be parralel and follow
        a straight line; if there were no boundary and the particle pressure
        remained constant despite that (eg, as if they were moving across the
        surface of a torus), this is the arrangement I'd expect the particles to
        take. Because there is a boundary, the best possible arrangement is a
        straight line with the minimal possible turning radius, in essence, a
        big circle. This is the arrangement of particles that minimises disorder
        in all definitions provided here.
      </p>
      <p style={{fontWeight: 'bold'}}>
        Measuring disorder: a quantitative approach
      </p>
      <p>
        We've looked at a few qualitative ways to think about disorder. Now
        let's put a number on it. We'll use the Kolgomorov approach: losslessly
        compress the data of some particle state as much as possible (using only
        methods that are easy to explain and analyse), and use the resulting
        filesize as an approximate measure of disorder.
      </p>
      <p>
        For the particle state, we will count the position, velocity, and radius
        of each particle, and disregard all other information as negligible. For
        the number format, each number will: use (up to) 32 bits, cover the (-4
        to 4) range, and be accurate to the nearest {`$2^{-29}$`} increment. So
        altogether an (uncompressed) particle will require 160 bits (32 * 5) of
        information to store. Position and velocity will be stored as polar
        coordinates ({`$p_{\\theta}$`}, {`$\\|p\\|$`}, {`$v_{\\theta}$`}, and{' '}
        {`$\\|v\\|$`}), with an origin at the simulation's center. The polar
        rotations will be stored in radians ({`$-\\pi$`} to {`$\\pi$`}), the
        position magnitudes will be scaled so that the distance between the
        simulation's top-left and bottom-right corner is {`$2\\sqrt{2}$`}. The
        velocity magnitudes will scaled so at{' '}
        {`$\\|v\\| = 2\\sqrt{2},\\text{ and Simulation Speed} = 1$`} a particle
        can travel from the top-left to bottom-right corner in one step.
      </p>
      <p>
        Storing a number in our format requires{' '}
        {`$\\text{bits}(x) = \\log_{2}(|x| + 2^{-29}) + 30$`} bits, so the
        closer its value is to 0 the better; for example, {`$4 - 2^{-29}$`}{' '}
        requires 32 bits, whereas {`$0.125 - 2^{-29}$`} requires only 27 bits.
        And if we look at an actual sample of 20,000 particles stored in our
        format we can see some of relevant the numbers are rather small, so on
        average, we only need{' '}
        {/*stats.inelastic.basic.total.meanDeviationBits.toFixed(3)*/} bits per
        particle rather than 160.
      </p>
      <AnalysisDisplayTable />
      <br />
      <table className="stats-table" style={{tableLayout: 'auto'}}>
        <tbody>
          <tr style={{fontWeight: 'bold'}}>
            <td>Column Name</td>
            <td>Definition</td>
            <td>Definition (total only)</td>
          </tr>
          <tr>
            <td colSpan="3">
              {`$x_{ij}$`} refers to the i<sup>th</sup> attribute of the j
              <sup>th</sup> particle
            </td>
          </tr>
          <tr>
            <td colSpan="3">
              {`$|a - b|$`} refers to the absolute difference between a & b,
              rather than the absolute value of {`$a - b$`}
              <br />
              So, for {`$a_{\\theta}$`} and {`$b_{\\theta}$`},{' '}
              {`$|-1.57 - 3.14| \\approx 1.57$`} rather than 4.71
            </td>
          </tr>
          <tr>
            <td>min</td>
            <td>{`$\\min(|x_i|)$`}</td>
            <td></td>
          </tr>
          <tr>
            <td>min (bits)</td>
            <td>{`$\\min(\\text{bits}(x_i))$`}</td>
            <td>{`$\\min(\\sum_{i=1}^5 \\text{bits}(x_i))$`}</td>
          </tr>
          <tr>
            <td>max</td>
            <td>{`$\\max(|x_i|)$`}</td>
            <td></td>
          </tr>
          <tr>
            <td>max (bits)</td>
            <td>{`$\\max(\\text{bits}(x_i))$`}</td>
            <td>{`$\\max(\\sum_{i=1}^5 \\text{bits}(x_i))$`}</td>
          </tr>
          <tr>
            <td>true mean</td>
            <td>{`$\\text{mean}(x_i)$`}</td>
            <td></td>
          </tr>
          <tr>
            <td>mean</td>
            <td>{`$\\text{mean}(|x_i|)$`}</td>
            <td></td>
          </tr>
          <tr>
            <td>mean (bits)</td>
            <td>{`$\\text{mean}(\\text{bits}(x_i))$`}</td>
            <td>{`$\\text{mean}(\\sum_{i=1}^5 \\text{bits}(x_i))$`}</td>
          </tr>
          <tr>
            <td>mean deviation</td>
            <td>{`$\\text{mean}(|x_i - \\text{mean}(x_i)|)$`}</td>
            <td></td>
          </tr>
          <tr>
            <td>
              <strong>mean deviation (bits)</strong>
            </td>
            <td>{`$\\text{mean}(\\text{bits}(|x_i - \\text{mean}(x_i)|))$`}</td>
            <td>{`$\\text{mean}(\\sum_{i=1}^5 \\text{bits}(|x_i - \\text{mean}(x_i)|))$`}</td>
          </tr>
          <tr>
            <td>max deviation</td>
            <td>{`$\\max(|x_i - \\text{mean}(x_i)|)$`}</td>
            <td></td>
          </tr>
          <tr>
            <td>max deviation (bits)</td>
            <td>{`$\\max(\\text{bits}(|x_i - \\text{mean}(x_i)|))$`}</td>
            <td>{`$\\max(\\sum_{i=1}^5 \\text{bits}(|x_i - \\text{mean}(x_i)|))$`}</td>
          </tr>
          <tr>
            <td>columns (bits)</td>
            <td>{`$\\text{ceil}(\\max(\\text{bits}(x_i)))$`}</td>
            <td>{`$\\sum_{i=1}^5 \\text{ceil}(\\max(\\text{bits}(x_i)))$`}</td>
          </tr>
          <tr>
            <td>buckets (bits)</td>
            <td>
              {`$B_i = \\{\\text{sorted}(|x_i|)_{\\text{ceil}(n \\cdot k)}: \\{0.5, 0.75, 0.875, 1\\}\\}$`}
              <br />
              {`$n^{-1} \\sum_{j=1}^n \\text{ceil}(\\text{bits}(\\min(B_i \\ge |x_{ij}|))) + 2$`}
            </td>
            <td>
              {`$B_i = \\{\\text{sorted}(|x_i|)_{\\text{ceil}(n \\cdot k)}: \\{0.5, 0.75, 0.875, 1\\}\\}$`}
              <br />
              {`$n^{-1} \\sum_{i=1}^5 \\sum_{j=1}^n \\text{ceil}(\\text{bits}(\\min(B_i \\ge |x_{ij}|))) + 10$`}
            </td>
          </tr>
          <tr>
            <td>LZMA (bits)</td>
            <td>{`$n^{-1} \\text{LZMA}(x_i)$`}</td>
            <td>{`$n^{-1} \\text{LZMA}(\\{x_i: \\{1..5\\}\\})$`}</td>
          </tr>
        </tbody>
      </table>
      <p>
        There are 3 things that may seem odd about using the mean deviation in
        our measure of information per particle, so let's explain/justify them:
      </p>
      <ol>
        <li>
          We're storing each value's deviation instead of the direct values.
          This is particularly useful, for example, when most values in a
          distribution lay between 1 and 1.001. Also, it's always the case that
          {`$|x - \\text{mean}(x)| \\le |x|$`} for {`$\\sum_{i=1}^n x_i$`}. And
          storing the averages necessary for recovering the direct values uses
          just a negligible amount of information.
        </li>
        <li>
          Partial bits. If you actually wanted to store bits(a) = 1.245 and
          bits(b) = 1.623 surely you'd need 4 bits, ceil(1.245) + ceil(1.623),
          rather than 1.245 + 1.623 bits?
        </li>
        <li>
          Uncertainty in {`$x_{ij}$`}. Surely {`$\\text{bits}(x_{ij})$`} should
          reflect the maximum possible value of {`$x_{ij}$`} rather than the
          value of {`$x_{ij}$`} itself? Is that equal to {`$\\max(x_i)$`}?
        </li>
      </ol>
      <p>
        Given the above points, one may imagine storing our data in 5 columns,
        each sized to accomodate the largest value in that column. This is the
        column strategy, which uses{' '}
        {/*stats.inelastic.basic.total.meanBitsColumnStrategy*/} bits per
        particle, using the same sample as above. Improving this, we could take
        inspiration from utf-8 encoding, and use the first two bits of each
        number to indicate how many bits are needed to store the rest of the
        number, this is the bucket strategy, which uses{' '}
        {/*stats.inelastic.basic.total.meanBitsBucketStrategy.toFixed(3)*/} bits
        per particle, and would be effective for power law distributions, since
        it prevents outliers from greatly impacting the filesize.
      </p>
      <p>
        So, it may seem like relying on the mean deviation underestimates
        filesize. But on the other hand, it may be an overestimate, since we can
        store information shared between particles in the same memory space; for
        example, we could train a neural network to spit out the attributes for{' '}
        {`$\\text{particle}_j$`} given {`$j$`} (an integer), storing our data
        inside the weights of the network; and/or we could apply a dictionary
        compression algorithm like{' '}
        <a
          rel="noreferrer"
          target="_blank"
          href="https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Markov_chain_algorithm"
        >
          LZMA
        </a>
        , either to the particle attributes or network weights. Let's split the
        difference and go with the simplest option then, with mean deviation.
        It's the easiest to analyse and will therefore provide more accurate
        insights into how disorder works.
      </p>
      <p>
        Now, instead of storing each particle's attributes relative to the
        center of the simulation, let's try storing the rotation, position, and
        radius relative to a nearby particle. If nearby particles are similar,
        then the numbers needed to store their attributes will be small. Let's
        begin by creating a euclidean minimum spanning tree (euclidean MST, by
        applying Kruskal's algorithm to the particle's Delaunay triangulation):
      </p>
      <p>
        We do not need to account for the {`$n log_2{n}$`} bits that'd
        ordinarily be needed to index the particle's position in the tree,
        because for any graph there exists a{' '}
        <a href="https://en.wikipedia.org/wiki/Degree-constrained_spanning_tree">
          balanced <i>k-constrained</i> MST
        </a>
        , a data structure that can store data compactly (finding such a tree
        can be quite complicated though, and I'm lazy, so I didn't actually
        implement an algorthim to do this).
      </p>
      <p>
        Edmond's algorthim (
        <a href="https://www2.seas.gwu.edu/~simhaweb/champalg/mst/papers/GabowMST.pdf">
          Galil's algorthim
        </a>{' '}
        would be better, but I was unable to find an implementation, and felt
        too lazy to make one)
      </p>
      <p>
        Better version of my idea:
        <a href="https://ieeexplore.ieee.org/document/7923738">
          Dmitri Pavlichin, Amir Ingber, and Tsachy Weissman
        </a>{' '}
        would be better, but I was unable to find an implementation, and felt
        too lazy to make one)
      </p>
      <p style={{fontWeight: 'bold'}}>
        Why do elastic collisions lead to maximal disorder? And inelastic
        collisions to minimal disorder?
      </p>
      <p></p>
      <p>Doing less means doing more, </p>
      <p>
        The particles spread evenly and move like the colours of a television
        tuned to a dead channel. They transmit no signal
      </p>
      <p>Convex surface with negative curvature</p>
      <p style={{fontWeight: 'bold'}}>Particles: Minimum disorder</p>
      <p style={{fontWeight: 'bold'}}>
        Particles: Why do elastic collisions maximise disorder
      </p>
      <p style={{fontWeight: 'bold'}}>
        Particles: Why do inelastic collisions minimise disorder
      </p>
      <h2 id="closing-remarks">Closing Remarks</h2>
      <p>
        I desperately want to do more research (full-time preferably, for the
        rest of my life), but lack the resources necessary for unleashing my
        full potential (funding, collaborators, and recognition). If you can
        help, please contact me via{' '}
        <a href="mailto:me@ashtonsix.com">me@ashtonsix.com</a>. I am a software
        engineer by profession, have no university education, and am not
        affiliated to any institution, but have steadily accumulated merit
        nevertheless.
      </p>
    </div>
  )
}

export default Explainer
