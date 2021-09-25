import {useEffect, useState} from 'react'
import Tex from '../../Text/Tex'
import AnalysisCollisions from '../analysis/AnalysisCollisions'
import AnalysisDisplayChart from '../analysis/AnalysisDisplayChart'
import AnalysisDisplayTable from '../analysis/AnalysisDisplayTable'
import csv from '../csv'

const ExplainerMethodology = () => {
  const [analyses, setAnalyses] = useState(null)
  useEffect(() => {
    ;(async () => {
      let elastic = await fetch('/particle-txt/elastic-analysis.csv')
      let inelastic = await fetch('/particle-txt/inelastic-analysis.csv')
      elastic = await elastic.text()
      inelastic = await inelastic.text()
      elastic = csv.parse(elastic)
      inelastic = csv.parse(inelastic)
      for (let l of elastic) l.sample = 'elastic'
      for (let l of inelastic) l.sample = 'inelastic'
      setAnalyses([].concat(elastic, inelastic))
    })()
  }, [])

  const elasticBits = (analyses ?? []).find(
    (l) =>
      l.method === 'delaunay' &&
      l.attribute === 'total' &&
      l.stat === 'meanBits' &&
      l.sample === 'elastic'
  )?.value
  const inelasticBits = (analyses ?? []).find(
    (l) =>
      l.method === 'delaunay' &&
      l.attribute === 'total' &&
      l.stat === 'meanBits' &&
      l.sample === 'inelastic'
  )?.value

  return (
    <div>
      <h2>Methodology: How To Measure Disorder</h2>
      <p>
        When running the simulation we observe a spontaneous decrease in
        disorder: with inelastic collisions all the particles line up with each
        other. There are a few ways we can measure disorder “by eye”. For
        example, we can look at how smooth the particle trails are, to see what
        effect constant velocity has (to do this properly, we'd take inspiration
        from lagrangian mechanics and measure the “action” of each path):
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="methodology 1"
            src="/particle-txt/methodology_1.png"
          />
          <p>
            Variable Velocity
            <br />
            (Low Disorder)
          </p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="methodology 2"
            src="/particle-txt/methodology_2.png"
          />
          <p>
            Constant Velocity
            <br />
            (High Disorder)
          </p>
        </span>
      </div>
      <p>
        Or, for another example, we can use the triangulation view to take a
        closer look at the{' '}
        <a
          rel="noopener"
          target="_blank"
          href="https://en.wikipedia.org/wiki/Grain_boundary"
        >
          grain structure
        </a>{' '}
        of densely packed particles (saturated areas identify where there's
        disorder):
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="methodology 3"
            src="/particle-txt/methodology_3.png"
          />
          <p>Particle View</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="methodology 4"
            src="/particle-txt/methodology_4.png"
          />
          <p>Triangulation View</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="methodology 5"
            src="/particle-txt/methodology_5.png"
          />
          <p>With More Particles</p>
        </span>
      </div>
      <p>
        One can learn more about how these visualisation tools work by pressing
        buttons and seeing what they do. To measure disorder quantitatively,
        we'll refer back to our defintion of disorder from{' '}
        <a href="/introduction">/introduction</a>, and estimate the length of
        the shortest possible description for a given particle state, which
        should be proportional to how much information / disorder is in that
        state.
      </p>
      <p>
        Each particle has a radius, velocity, and position. For each particle,
        let us take the value of these properties relative to other nearby
        particles, such that the values will be smaller if the particles are
        more similar. We observe that with fixed precision it takes{' '}
        <Tex>{`\\operatorname{bits}(x) = \\log_2(|x| + 2^{-p}) + p + 1`}</Tex>{' '}
        bits to describe a signed value, so the smaller a value the less
        information and disorder it contains.
      </p>
      <p>
        Let's take the particle's Delaunay Triangulation (captioned above as
        “triangulation view”), and measure how dissimilar the particles at the
        end of each edge are (the “distance”). We'll then take the mean of each
        edge's distance in bits, and use that as an estimate for disorder per
        particle. To standardise our measurements, let's go with a range of -4
        to 4 for each value; so angles will go from <Tex>{`-\\pi`}</Tex> to{' '}
        <Tex>{`\\pi`}</Tex>, and we'll scale distances so from the simulation's
        top-left to bottom-right corner is <Tex>{`2\\sqrt{2}`}</Tex>, and we'll
        say particles travel 1 unit of distance per step; we'll go with 29 bits
        of precision (<Tex>{`p{=}29`}</Tex>), which gives us 32 bits for the
        largest possible value. Here are the metrics we will use:
      </p>
      <table
        className="stats-table"
        style={{
          tableLayout: 'auto',
          overflowX: 'initial',
          maxWidth: 500,
          margin: '0 auto',
        }}
      >
        <tbody>
          <tr style={{fontWeight: 'bold'}}>
            <td>Metric</td>
            <td>Definition</td>
          </tr>
          <tr>
            <td>Radius</td>
            <td>
              <Tex>{`r_1 - r_2`}</Tex>
            </td>
          </tr>
          <tr>
            <td>Touching Distance</td>
            <td>
              <Tex>{`\\|p_1 - p_2\\| - (r_1 + r_2)`}</Tex>
            </td>
          </tr>
          <tr>
            <td>Structure</td>
            <td>
              <Tex>{`p^{\\theta}_1 + p^{\\theta}_2`}</Tex>
            </td>
          </tr>
          <tr>
            <td>Velocity (magnitude)</td>
            <td>
              <Tex>{`\\|v_1\\| - \\|v_2\\|`}</Tex>
            </td>
          </tr>
          <tr>
            <td>Velocity (direction)</td>
            <td>
              <Tex>{`\\cos^{-1}\\frac{\\vphantom{\\|}v_1 \\cdot v_2}{\\|v_1\\| \\|v_2\\|}`}</Tex>
            </td>
          </tr>
          <tr>
            <td>Total</td>
            <td>
              <Tex>{`\\sum_{i=1}^5 \\text{metric}_i`}</Tex>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        All of these are straightforward, except for “structure”, which requires
        a little more explaining. Structure is a proxy for disorder in
        positional orientation, the more tile-like the particle's structure, the
        less disorderd it is. We measure this with a heuerstic: for each edge,
        how similar are its adjacent angles? This, by the way, is almost
        equivalent to asking: if one were to draw lines through all the
        particles, how straight could one get them to be?
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, height: 180, border: '1px solid #ccc'}}
            alt="structure 1"
            src="/particle-txt/structure_1.png"
          />
          <p>
            <Tex>{`p^{\\theta}_1 = A - B`}</Tex>
          </p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, height: 180, border: '1px solid #ccc'}}
            alt="structure 2"
            src="/particle-txt/structure_2.png"
          />
          <p>
            <Tex>{`p^{\\theta}_1 = 2A`}</Tex>
          </p>
        </span>
      </div>
      <p>
        We've now figured out everything needed to measure the disorder for a
        given particle state. Let's compare the final states from two
        experiments:
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, height: 180, border: '1px solid #ccc'}}
            alt="analysis 2"
            src="/particle-txt/analysis_2.png"
          />
          <p>
            With elastic collisions (
            <a href="/particle-txt/elastic-state.csv" download>
              download
            </a>
            )
          </p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, height: 180, border: '1px solid #ccc'}}
            alt="analysis 1"
            src="/particle-txt/analysis_1.png"
          />
          <p>
            With inelastic collisions (
            <a href="/particle-txt/inelastic-state.csv" download>
              download
            </a>
            )
          </p>
        </span>
      </div>
      <p>
        We should find the inelastic collision state is less disorderd, and we
        do. On average, the particles from the inelastic collision state have{' '}
        {(elasticBits - inelasticBits || 0).toFixed(0)} bits less disorder than
        those from the elastic collision state (
        {(inelasticBits || 0).toFixed(0)} vs {(elasticBits || 0).toFixed(0)}
        ):
      </p>
      {analyses ? (
        <AnalysisDisplayTable statsFromProps={analyses} />
      ) : (
        <div>Loading...</div>
      )}
      <p>
        I reckon looking at the mean distance in bits for each edge on the
        delaunay triangulation gives the most insightful measure of disorder for
        a particular state, but we ought to look at a few other measures. If one
        clicks “show more”, they'll see a bunch of other stats to choose from,
        like the min, median, etc. One can also upload particle states from the
        simulation to do their own exploration.
      </p>
      <p>
        Anyway, thinking about how data actually gets stored on the computer, we
        realise that in most formats partial bits aren't allowed and that values
        are generally stored with some leading zeros. So I added some
        “realistic” metrics for column-based and variable width encoding. And
        like, since information refers to the length of the shortest possible
        description for a state we should try running the state through digital
        compression too, right? So I added a third metric, based on LZMA
        compression (the algorithm from 7zip). None of these metrics tell us
        anything useful, but we got them (under “show more”).
      </p>
      <table
        className="stats-table"
        style={{tableLayout: 'auto', overflowX: 'initial'}}
      >
        <tbody>
          <tr style={{fontWeight: 'bold'}}>
            <td></td>
            <td>Definition</td>
            <td>Definition (total only)</td>
          </tr>
          <tr>
            <td colSpan="3">
              <Tex>{`x_{ij}`}</Tex> refers to the i<sup>th</sup> metric of the j
              <sup>th</sup> edge
            </td>
          </tr>
          <tr>
            <td colSpan="3">
              <Tex>{`|a - b|`}</Tex> refers to the absolute difference between a
              & b, rather than the absolute value of <Tex>{`a - b`}</Tex>
              <br />
              So, for <Tex>{`a_{\\theta}`}</Tex> and <Tex>{`b_{\\theta}`}</Tex>,{' '}
              <Tex>{`|-1.57 - 3.14| \\approx 1.57`}</Tex> rather than 4.71
            </td>
          </tr>
          <tr>
            <td>
              {'{'}min, p5, ..., max{'}'}
            </td>
            <td>
              <Tex>{`\\{\\operatorname{sorted}(|x_i|)_{\\operatorname{ceil}(n \\cdot k)} : \\{0, 0.05, ..., 1\\} \\}`}</Tex>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>
              {'{'}min, p5, ..., max{'}'} (bits)
            </td>
            <td>
              <Tex>{`\\{\\operatorname{sorted}(\\operatorname{bits}(x_i))_{\\operatorname{ceil}(n \\cdot k)} : \\{0, 0.05, ..., 1\\} \\}`}</Tex>
            </td>
            <td>
              <Tex>{`\\{\\operatorname{sorted}(\\sum_{i=1}^5 \\operatorname{bits}(x_i))_{\\operatorname{ceil}(n \\cdot k)} : \\{0, 0.05, ..., 1\\} \\}`}</Tex>
            </td>
          </tr>
          <tr>
            <td>mean</td>
            <td>
              <Tex>{`\\operatorname{mean}(|x_i|)`}</Tex>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>mean (bits)</td>
            <td>
              <Tex>{`\\operatorname{mean}(\\operatorname{bits}(x_i))`}</Tex>
            </td>
            <td>
              <Tex>{`\\operatorname{mean}(\\sum_{i=1}^5 \\operatorname{bits}(x_i))`}</Tex>
            </td>
          </tr>
          <tr>
            <td>true mean</td>
            <td>
              <Tex>{`\\operatorname{mean}(x_i)`}</Tex>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>mean deviation</td>
            <td>
              <Tex>{`\\operatorname{mean}(|x_i - \\operatorname{mean}(x_i)|)`}</Tex>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>mean deviation (bits)</td>
            <td>
              <Tex>{`\\operatorname{mean}(\\operatorname{bits}(|x_i - \\operatorname{mean}(x_i)|))`}</Tex>
            </td>
            <td>
              <Tex>{`\\operatorname{mean}(\\sum_{i=1}^5 \\operatorname{bits}(|x_i - \\operatorname{mean}(x_i)|))`}</Tex>
            </td>
          </tr>
          <tr>
            <td>columns (bits)</td>
            <td>
              <Tex>{`\\operatorname{ceil}(\\max(\\operatorname{bits}(x_i)))`}</Tex>
            </td>
            <td>
              <Tex>{`\\sum_{i=1}^5 \\operatorname{ceil}(\\max(\\operatorname{bits}(x_i)))`}</Tex>
            </td>
          </tr>
          <tr>
            <td>
              <a
                target="_blank"
                rel="noopener"
                href="https://en.wikipedia.org/wiki/Variable-width_encoding"
              >
                varwidth
              </a>{' '}
              (bits)
            </td>
            <td>
              <Tex>{`B_i = \\{\\operatorname{sorted}(|x_i|)_{\\operatorname{ceil}(n \\cdot k)}: \\{0.5, 0.75, 0.875, 1\\}\\}`}</Tex>
              <br />
              <Tex>{`\\left(\\sum_{j=1}^n \\operatorname{ceil}(\\operatorname{bits}(\\min(B_i \\ge |x_{ij}|))) + 2\\right) / n`}</Tex>
            </td>
            <td>
              <Tex>{`B_i = \\{\\operatorname{sorted}(|x_i|)_{\\operatorname{ceil}(n \\cdot k)}: \\{0.5, 0.75, 0.875, 1\\}\\}`}</Tex>
              <br />
              <Tex>{`\\left(\\sum_{i=1}^5 \\sum_{j=1}^n \\operatorname{ceil}(\\operatorname{bits}(\\min(B_i \\ge |x_{ij}|))) + 10\\right) / n`}</Tex>
            </td>
          </tr>
          <tr>
            <td>
              <a
                target="_blank"
                rel="noopener"
                href="https://en.wikipedia.org/wiki/Lempel%E2%80%93Ziv%E2%80%93Markov_chain_algorithm"
              >
                LZMA
              </a>{' '}
              (bits)
            </td>
            <td>
              <Tex>{`\\operatorname{LZMA}(x_i) / n`}</Tex>
            </td>
            <td>
              <Tex>{`\\operatorname{LZMA}(\\{x_i: \\{1..5\\}\\}) / n`}</Tex>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Continuing our “how to actually store the particle state on a computer”
        thinking, let's realise delaunay triangulation generates lots of edges
        per particle, whereas we only need keep one edge per particle to
        reproduce a given state, and we can identify which edges to keep with a
        minimum spanning tree algorithm. Under “show more” we have “relative to
        nearby particle (A)”, “... (B)”, and “... (C)”. The edges for A come
        from the delaunay triangulation, the edges for B come from a euclidean
        minimum spanning tree, the edges for C come from an approximate minimum
        spanning tree with distance in information as the metric to minimise
        (starting from A rather than a fully-connected graph). For C, I took the
        lazy version of prim's algorithm and adapted it to incorporate the
        straightness of branches into the distance function. Unfortunately these
        more “realistic” approach to measurement don't tell us anything useful
        about disorder either. But like, I did the work and would feel bad
        throwing it away. At least the visualisations look pretty.
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, height: 180, border: '1px solid #ccc'}}
            alt="tree 1"
            src="/particle-txt/tree_1.png"
          />
          <p>Minimum Spanning Tree</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, height: 180, border: '1px solid #ccc'}}
            alt="tree 2"
            src="/particle-txt/tree_2.png"
          />
          <p>With more particles</p>
        </span>
      </div>
      <p>
        So now we can measure how disorderd a particle state is at some point in
        time. And to look at how disorder changes over time we just need to run
        an analysis every step. Doing this, we see, from a random initial state
        with inelastic collisions, that the simulation's disorder decreases
        sigmoidally:
      </p>
      <AnalysisDisplayChart />
      <p>
        To repeat this yourself, use the simulation's “Make Video Recording”
        feature, make sure to check “Include Analyses”, combine the CSVs, and
        then click the “Upload Analyses” button.
      </p>
      <p>
        Moving on, let's look at the mechanism through which disorder is
        destroyed. It's our hypothesis that when two particles collide
        inelastically they will likely become more self-similar. So let's
        measure how much more similar two particles become when they collide. We
        will measure the change in relative orientiation, change in relative
        velocity and, for good measure, change in relative momentum; for a given
        set of collisions and parameters (particle elasticity, constant mass,
        constant velocity). Giving us the map:
      </p>
      <p style={{textAlign: 'center'}}>
        <Tex block>{`
          \\displaylines{
            \\{\\text{Collisions}, \\text{Elasticity}, \\text{Constant Mass}, \\text{Constant Velocity}\\} \\to \\\\
            \\{\\Delta \\text{Relative Orientation}, \\Delta \\text{Relative Velocity}, \\Delta \\text{Relative Momentum} \\}
          }
        `}</Tex>
      </p>
      <p>
        For the preimage, <Tex>{`\\text{Collisions}`}</Tex> is a set and the
        other inputs are primitives. All metrics in the image are sets, here are
        the member definitions:
      </p>
      <table
        className="stats-table"
        style={{
          tableLayout: 'auto',
          overflowX: 'initial',
          maxWidth: 500,
          margin: '0 auto',
        }}
      >
        <tbody>
          <tr style={{fontWeight: 'bold'}}>
            <td>Metric</td>
            <td>Definition</td>
          </tr>
          <tr>
            <td>Δ Relative Orientation</td>
            <td>
              <Tex>{`
                \\operatorname{bits}(\\operatorname{atan2}{v_2^{t{=}2}}) -
                \\operatorname{bits}(\\operatorname{atan2}{v_2^{t{=}1}})
              `}</Tex>
            </td>
          </tr>
          <tr>
            <td>Δ Relative Velocity</td>
            <td>
              <Tex>{`
                \\operatorname{bits}(\\|v_2^{t{=}2} - [1, 0]\\|) -
                \\operatorname{bits}(\\|v_2^{t{=}1} - [1, 0]\\|)
              `}</Tex>
            </td>
          </tr>
          <tr>
            <td>Δ Relative Momentum</td>
            <td>
              <Tex>{`
                \\operatorname{bits}(\\|\\mathbf{p}_2^{t{=}2} - [1, 0]\\|) -
                \\operatorname{bits}(\\|\\mathbf{p}_2^{t{=}1} - [1, 0]\\|)
              `}</Tex>
            </td>
          </tr>
        </tbody>
      </table>
      <p>
        Looking at the set of all possible collisions, we realise many
        collisions produce the exact same change in disorder (when we consider
        just the two colliding particles), so let's simplify the collisions'
        preimage by applying a linear transformation such that{' '}
        <Tex>{`r_1=1`}</Tex>, <Tex>{`p_1=[0,0]`}</Tex>,{' '}
        <Tex>{`v_1 = [1, 0]`}</Tex> and <Tex>{`p_2^y \\ge 0`}</Tex> (scale,
        translate, rotate and flip), which yields three free variables for each
        collision:
      </p>
      <ol>
        <li>
          <Tex>{`0 \\le \\text{Contact Point} \\le \\pi`}</Tex>
        </li>
        <li>
          <Tex>{`\\text{Relative Velocity} = v_2 - [1, 0]`}</Tex>
        </li>
        <li>
          <Tex>{`\\text{Relative Radius} = r_2`}</Tex>
        </li>
      </ol>
      <p>
        We'll simplify again after the collision and before taking metrics.
        Alright. Now if we use the “Make Video Recording” feature, check
        “Include Collisions” and combine the CSVs, we'll have a set of
        collisions to look at. For our test I recorded 100,000 collisions with
        these settings:
      </p>
      <div style={{textAlign: 'center'}}>
        <img
          style={{padding: 10, border: '1px solid #ccc'}}
          alt="collisions state"
          src="/particle-txt/collisions-state.jpg"
        />
        <p>
          Download this{' '}
          <a href="/particle-txt/collisions-state.csv" download>
            state
          </a>{' '}
          and{' '}
          <a href="/particle-txt/collisions.csv" download>
            set of collisions
          </a>{' '}
          if you want
        </p>
      </div>
      <p>
        By our new measure, with elasticity = 1.0, we confirm the average
        collision creates some disorder in orientation and velocity (numbers
        shown below). We also discover Δ Relative Velocity = Δ Relative Momentum
        because{' '}
        <Tex>{`\\log_2(a) - \\log_2(b) = \\log_2(ax) - \\log_2(bx)`}</Tex>. And
        we confirm with elasticity = 0.9 the average collision destroys disorder
        (numbers not shown, run the calculations if you want to see them):
      </p>
      <AnalysisCollisions />
      <p>
        So we can now estimate the amount of disorder in a given state at a
        point in time or across a range of time, and estimate the change in
        disorder caused by a set of collisions.
      </p>
      <h2>Uncategorised Notes</h2>
      <p>
        Disorder changes far slower with constant velocity. With variable
        velocity setting elasticity to 98% or 102% will cause a soon-noticeable
        shift in disorder, but getting that same rate of change with constant
        velocity may require setting elasticity to 80% or 120%. I predict
        constant mass does the same, but to a lesser extent (haven't checked,
        but have made all the tools needed for someone else to take a look).
      </p>
      <p>
        There should exist a molecular dynamics software package with a superset
        of my simulation's functionality included, which would enable all sorts
        of cool follow-up experiments; like, what about triangle-shaped or 3D
        particles? It may be worth going through{' '}
        <a href="https://en.wikipedia.org/wiki/Comparison_of_software_for_molecular_mechanics_modeling">
          en.wikipedia.org/wiki/Comparison of software for molecular mechanics
          modeling
        </a>{' '}
        to try and find something.
      </p>
      <p>
        I wonder whether it'd be accurate to say inelastic scattering on a
        surface is just like elastic scattering, except with inelastic
        scattering the surface has “extra negative curvature”? Would that allow
        one to make use of theorems from the study of dynamical billiards? And
        predict the rate at which disorder is created or destroyed without
        directly measuring it? I dunno if there's much research into many-body
        billiards or self-interacting ideal gas to work from.
      </p>
      <p>
        A valve that would normally act as a thermodynamic resistor with elastic
        collisions acts as a thermodynamic pump with inelastic collisions:
      </p>
      <div style={{textAlign: 'center'}}>
        <img
          style={{padding: 10, border: '1px solid #ccc'}}
          alt="valve"
          src="/particle-txt/valve.jpg"
        />
      </div>
      <p>
        I can think of two ways to use inelastic scattering as a pump mechanism
        in the real-world. They do not violate the second law of thermodynamics.
        They are possible in theory but maybe not in practice (give it a try if
        you have the relevant appartus!). Here:
      </p>
      <ol>
        <li>
          Put some liquid in a tesla valve & cool the valve. So long as the
          valve is colder than the liquid inside the valve will act as a pump,
          since collisions between the liquid particles and valve will be
          inelastic.
        </li>
        <li>
          Put some supercool liquid in a tesla valve and shake it. So long as
          the liquid has more kinetic than thermal energy the valve will act as
          a pump, since collisions between liquid particles will be inelastic.
          Does this define Bose-Einstein condensation? (email me if you know)
        </li>
      </ol>
      <h2>Conclusion</h2>
      <p>
        Thank you for reading, I hope you found something interesting. I've put
        links to more of my stuff at <a href="/introduction">/introduction</a>.
        If you have any questions, comments, criticisms or whatever go ahead and
        send a message to{' '}
        <a href="mailto:me@ashtonsix.com" target="_blank" rel="noopener">
          me@ashtonsix.com
        </a>
        . Thanks again.
      </p>
    </div>
  )
}

export default ExplainerMethodology
