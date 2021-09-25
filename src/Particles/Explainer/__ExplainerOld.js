import React from 'react'
import Tex from '../../Text/Tex'

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
        When energy is all mixed-up or spread-out we say it's in a state of{' '}
        <i>disorder</i>. Using a littany of definitions for our conceptual tools
        gives us more ways of seeing the challenges before us, so let's look at
        how a few notable scholars may potentially define disorder:
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
        Whereas sequence 2 has <Tex>{`26^{16}`}</Tex> possibilities, a much
        bigger number, and therefore sequence 1 is less disordered.
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
          alt="disorder 0"
          src="/explainer/disorder_0.png"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />{' '}
        vs.{' '}
        <img
          alt="disorder 1"
          src="/explainer/disorder_1.bmp"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />
      </p>
      <p>
        Kolgomorov. After trying to get the filesize of each image as small as
        possible,{' '}
        <img
          alt="disorder 0"
          src="/explainer/disorder_0.png"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />{' '}
        came out as 107 bytes, and{' '}
        <img
          alt="disorder 1"
          src="/explainer/disorder_1.bmp"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />{' '}
        came out as 2,112 bytes, so{' '}
        <img
          alt="disorder 0"
          src="/explainer/disorder_0.png"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />{' '}
        is less disordered. With an inexact but similar reproduction of{' '}
        <img
          alt="disorder 1"
          src="/explainer/disorder_1.bmp"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />
        , like this:{' '}
        <img
          alt="disorder 1"
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
          alt="disorder 2"
          src="/explainer/disorder_2.png"
          loading="lazy"
          style={{verticalAlign: 'middle', padding: '2px 0'}}
        />{' '}
        vs.{' '}
        <img
          alt="disorder 3"
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
          alt="slope 0"
          src="/explainer/slope_0.png"
          loading="lazy"
          style={{height: 120}}
        />{' '}
        vs.{' '}
        <img
          alt="slope 1"
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
        alt="thermodynamics 1"
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
        alt="disorder stats"
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
          alt="lorenz pressure"
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
        360°), then we can save <Tex>{`\\log_2(\\frac{360}{10})`}</Tex>, or
        5.17, bits per particle on storage for their orientation without losing
        precision.
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
    </div>
  )
}

export default Explainer
