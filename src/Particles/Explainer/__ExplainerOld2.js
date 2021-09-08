import React from 'react'
import AnalysisDisplayTable from '../analysis/AnalysisDisplayTable'
import Tex from '../Tex'

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
      <h2>Measuring disorder: a quantitative approach</h2>
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
        to 4) range, and be accurate to the nearest <Tex>{`2^{-29}`}</Tex>{' '}
        increment. So altogether an (uncompressed) particle will require 160
        bits (32 * 5) of information to store. Position and velocity will be
        stored as polar coordinates (<Tex>{`p_{\\theta}`}</Tex>,{' '}
        <Tex>{`\\|p\\|`}</Tex>, <Tex>{`v_{\\theta}`}</Tex>, and{' '}
        <Tex>{`\\|v\\|`}</Tex>), with an origin at the simulation's center. The
        polar rotations will be stored in radians (<Tex>{`-\\pi`}</Tex> to{' '}
        <Tex>{`\\pi`}</Tex>), the position magnitudes will be scaled so that the
        distance between the simulation's top-left and bottom-right corner is{' '}
        <Tex>{`2\\sqrt{2}`}</Tex>. The velocity magnitudes will scaled so at{' '}
        <Tex>{`\\|v\\| = 2\\sqrt{2},\\text{ and Simulation Speed} = 1`}</Tex> a
        particle can travel from the top-left to bottom-right corner in one
        step.
      </p>
      <p>
        Storing a number in our format requires{' '}
        <Tex>{`\\text{bits}(x) = \\log_{2}(|x| + 2^{-29}) + 30`}</Tex> bits, so
        the closer its value is to 0 the better; for example,{' '}
        <Tex>{`4 - 2^{-29}`}</Tex> requires 32 bits, whereas{' '}
        <Tex>{`0.125 - 2^{-29}`}</Tex> requires only 27 bits. And if we look at
        an actual sample of 20,000 particles stored in our format we can see
        some of relevant the numbers are rather small, so on average, we only
        need {/*stats.inelastic.basic.total.meanDeviationBits.toFixed(3)*/} bits
        per particle rather than 160.
      </p>
      <AnalysisDisplayTable />
      <br />
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
              <Tex>{`x_{ij}`}</Tex> refers to the i<sup>th</sup> attribute of
              the j<sup>th</sup> particle
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
              <Tex>{`\\{\\text{sorted}(|x_i|)_{\\text{ceil}(n \\cdot k)} : \\{0, 0.05, ..., 1\\} \\}`}</Tex>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>
              {'{'}min, p5, ..., max{'}'} (bits)
            </td>
            <td>
              <Tex>{`\\{\\text{sorted}(\\text{bits}(x_i))_{\\text{ceil}(n \\cdot k)} : \\{0, 0.05, ..., 1\\} \\}`}</Tex>
            </td>
            <td>
              <Tex>{`\\{\\text{sorted}(\\sum_{i=1}^5 \\text{bits}(x_i))_{\\text{ceil}(n \\cdot k)} : \\{0, 0.05, ..., 1\\} \\}`}</Tex>
            </td>
          </tr>
          <tr>
            <td>mean</td>
            <td>
              <Tex>{`\\text{mean}(|x_i|)`}</Tex>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>mean (bits)</td>
            <td>
              <Tex>{`\\text{mean}(\\text{bits}(x_i))`}</Tex>
            </td>
            <td>
              <Tex>{`\\text{mean}(\\sum_{i=1}^5 \\text{bits}(x_i))`}</Tex>
            </td>
          </tr>
          <tr>
            <td>true mean</td>
            <td>
              <Tex>{`\\text{mean}(x_i)`}</Tex>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>mean deviation</td>
            <td>
              <Tex>{`\\text{mean}(|x_i - \\text{mean}(x_i)|)`}</Tex>
            </td>
            <td></td>
          </tr>
          <tr>
            <td>mean deviation (bits)</td>
            <td>
              <Tex>{`\\text{mean}(\\text{bits}(|x_i - \\text{mean}(x_i)|))`}</Tex>
            </td>
            <td>
              <Tex>{`\\text{mean}(\\sum_{i=1}^5 \\text{bits}(|x_i - \\text{mean}(x_i)|))`}</Tex>
            </td>
          </tr>
          <tr>
            <td>columns (bits)</td>
            <td>
              <Tex>{`\\text{ceil}(\\max(\\text{bits}(x_i)))`}</Tex>
            </td>
            <td>
              <Tex>{`\\sum_{i=1}^5 \\text{ceil}(\\max(\\text{bits}(x_i)))`}</Tex>
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
              <Tex>{`B_i = \\{\\text{sorted}(|x_i|)_{\\text{ceil}(n \\cdot k)}: \\{0.5, 0.75, 0.875, 1\\}\\}`}</Tex>
              <br />
              <Tex>{`n^{-1} \\sum_{j=1}^n \\text{ceil}(\\text{bits}(\\min(B_i \\ge |x_{ij}|))) + 2`}</Tex>
            </td>
            <td>
              <Tex>{`B_i = \\{\\text{sorted}(|x_i|)_{\\text{ceil}(n \\cdot k)}: \\{0.5, 0.75, 0.875, 1\\}\\}`}</Tex>
              <br />
              <Tex>{`n^{-1} \\sum_{i=1}^5 \\sum_{j=1}^n \\text{ceil}(\\text{bits}(\\min(B_i \\ge |x_{ij}|))) + 10`}</Tex>
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
              <Tex>{`n^{-1} \\text{LZMA}(x_i)`}</Tex>
            </td>
            <td>
              <Tex>{`n^{-1} \\text{LZMA}(\\{x_i: \\{1..5\\}\\})`}</Tex>
            </td>
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
          <Tex>{`|x - \\text{mean}(x)| \\le |x|`}</Tex> for{' '}
          <Tex>{`\\sum_{i=1}^n x_i`}</Tex>. And storing the averages necessary
          for recovering the direct values uses just a negligible amount of
          information.
        </li>
        <li>
          Partial bits. If you actually wanted to store bits(a) = 1.245 and
          bits(b) = 1.623 surely you'd need 4 bits, ceil(1.245) + ceil(1.623),
          rather than 1.245 + 1.623 bits?
        </li>
        <li>
          Uncertainty in <Tex>{`x_{ij}`}</Tex>. Surely{' '}
          <Tex>{`\\text{bits}(x_{ij})`}</Tex> should reflect the maximum
          possible value of <Tex>{`x_{ij}`}</Tex> rather than the value of{' '}
          <Tex>{`x_{ij}`}</Tex> itself? Is that equal to{' '}
          <Tex>{`\\max(x_i)`}</Tex>?
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
        {/*stats.inelastic.basic.total.meanBitsvarwidthtrategy.toFixed(3)*/}{' '}
        bits per particle, and would be effective for power law distributions,
        since it prevents outliers from greatly impacting the filesize.
      </p>
      <p>
        So, it may seem like relying on the mean deviation underestimates
        filesize. But on the other hand, it may be an overestimate, since we can
        store information shared between particles in the same memory space; for
        example, we could train a neural network to spit out the attributes for{' '}
        <Tex>{`\\text{particle}_j`}</Tex> given <Tex>{`j`}</Tex> (an integer),
        storing our data inside the weights of the network; and/or we could
        apply a dictionary compression algorithm like{' '}
        <a
          rel="noopener"
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
        We do not need to account for the <Tex>{`n log_2{n}`}</Tex> bits that'd
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
      <h2>
        Why do elastic collisions lead to maximal disorder? And inelastic
        collisions to minimal disorder?
      </h2>
      <p></p>
      <p>Doing less means doing more, </p>
      <p>
        The particles spread evenly and move like the colours of a television
        tuned to a dead channel. They transmit no signal
      </p>
      <p>Convex surface with negative curvature</p>
      <h2>Particles: Minimum disorder</h2>
      <h2>Particles: Why do elastic collisions maximise disorder</h2>
      <h2>Particles: Why do inelastic collisions minimise disorder</h2>
      <h2>Replication in the real world</h2>
      <h2>See also</h2>
    </div>
  )
}

export default Explainer
