import React, {useEffect} from 'react'

const Definition = ({label, math}) => (
  <span style={{display: 'block'}}>
    <span style={{display: 'inline-block', minWidth: 120, paddingRight: 8}}>
      {label}:
    </span>
    {' $ ' + math + ' $'}
    <br />
  </span>
)

const Explainer = () => {
  useEffect(() => {
    const alreadyLoaded = document.querySelector('#MathJax-script')
    if (alreadyLoaded) {
      window.MathJax.texReset()
      window.MathJax.typesetClear()
      window.MathJax.typesetPromise()
    }
    window.MathJax = {
      tex: {
        inlineMath: [
          ['$', '$'],
          ['\\(', '\\)'],
        ],
      },
      chtml: {
        displayAlign: 'left',
        displayIndent: '2em',
      },
      startup: {
        ready: () => {
          window.MathJax.startup.defaultReady()
          window.MathJax.texReset()
          window.MathJax.typesetClear()
          window.MathJax.typesetPromise()
        },
      },
    }
    const script = document.createElement('script')
    script.id = 'MathJax-script'
    script.async = true
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'
    document.body.appendChild(script)
    return () => []
  })
  return (
    <div
      style={{
        maxWidth: 'calc(max(min(100vh, 100vw) - 65px, 500px))',
        fontSize: '18px',
      }}
    >
      <h2 style={{marginTop: 0}} id="explainer">
        What is this?
      </h2>
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
        it is also a general-purpose particle simulator, suitable for
        pedagogical purposes. I encourage you to play around and try things, if
        you're not sure where to start try replicating this figure and go from
        there:
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
      <p>
        In the sections that follow we will,{' '}
        <a href="#simulation-physics">one</a>, describe the physics of this
        simulation, and <a href="#inelasticity-thermodynamics">two</a>, discuss
        inelastic collision in the context of thermodynamics.
      </p>
      <h2 id="simulation-physics">Simulation Physics</h2>
      <p>
        This section exists primarily for due diligence, to share technical
        details. It doesn't describe anything particularly new or novel, so you
        may wish to skip ahead to the{' '}
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
        closest point on the boundary for each particle (I think this is an
        original algorithm). Each point on the boundary consists of a position
        and a normal (inwards-pointing vector). The point associations are shown
        below at one sixteenth of the actual resolution:
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
        This translation constrains {`$p$`} to a line parallel to {`$T$`} and
        exactly {`$r$`} distance away from {`$T$`}, {`$p$`} will be {`$r$`}{' '}
        distance away from {`$N$`} at most.
      </p>
      <p>
        Get the closest point on the boundary again, and check for a collision,
        if there is a collision:
      </p>
      <p style={{paddingLeft: '2em'}}>
        {`$N := \\overline{\\text{mix}(\\overline{N_0}, \\overline{N_1}, 0.5)}$`}
        <br />
        {`$P := \\text{mix}(P_0, P_1, 0.5)$`}
        <br />
        {`$\\text{Translate the particle again, by repeating the above method}$`}
        {`$\\text{Collides With Two Points Simultaneously} = \\text{True}$`}
      </p>
      <p>To update the velocity:</p>
      <p>{`$$
        v := \\left \\{\\begin{aligned}
          &v - 2\\overline{N}(\\overline{N} \\cdot v), && \\text{if}\\ \\text{Boundary Elasticity = True}\\\\
          &v - 2\\overline{N}(\\overline{N} \\cdot v), && \\text{if}\\ \\text{Collides With Two Points Simultaneously}\\\\
          &\\overline{T} \\|v\\| \\cdot \\text{sgn}(\\overline{T} \\cdot v), && \\text{otherwise}
        \\end{aligned} \\right.
      $$`}</p>
      <h4>Particle Collisions</h4>
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
        $$p_0 := p_0 + \\dfrac{r_0 + r_1 - \\|n\\|}{2}$$ 
        $$p_1 := p_1 - \\dfrac{r_0 + r_1 - \\|n\\|}{2}$$ 
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
        Inelalstic Collisions and Thermodynamics
      </h2>
      <p>
        In this section I'm more concerned with getting the philosophy right
        than the physics.
      </p>
      <p>Kolgomorov Shannon Bolztmann Markov Juarrero</p>
      <h2 id="closing-remarks">Closing Remarks</h2>
    </div>
  )
}

export default Explainer
