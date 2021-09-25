import Tex from './Tex'

export default (
  <>
    <h2>Speculation: Connections To the Real World</h2>
    <p>D</p>
    <p>
      In the formula <Tex>{`a\\text{ to }b`}</Tex>, <Tex>{`a`}</Tex> and{' '}
      <Tex>{`b`}</Tex> are the 5<sup>th</sup> and 95<sup>th</sup> percentile of
      a gaussian distribution.
    </p>
    <p style={{textAlign: 'center'}}>
      <Tex>{`d \\rightarrow u + W^- \\rightarrow u + e^- + \\overline{v_{e}}`}</Tex>
      <br />
      <Tex>{``}</Tex>
      <br />
      <Tex>{`
      \\begin{align}
      \\sqrt{d} - (\\sqrt{u} + \\sqrt{e}) & ≈ 0 \\\\
      \\sqrt{4100000\\text{ to }5100000} - (\\sqrt{1800000\\text{ to }2800000} + \\sqrt{511000}) & ≈ 0 \\\\
      1300\\text{ to }1700 - (2000\\text{ to }2300 + 715) & ≈ 0 \\\\
      -120\\text{ to }280 & ≈ 0
      \\end{align}
    `}</Tex>
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
      Although the simulation seems to have an electromagnetic force equivalent,
      we observe no obvious equivalents to virtual particles or flux tubes,
      indicating a different mechanism at work.
    </p>
    <p>
      The quasiparticles have smooth shear lines, rough shear lines, rough
      ripple lines
    </p>
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <span style={{width: 364, padding: 10, textAlign: 'center'}}>
        <img
          style={{padding: 10, width: 342, border: '1px solid #ccc'}}
          alt="pion jefferson"
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
    <p>monte carlo estimate with gaussian priors</p>
    <p>Two intertwined spirals</p>
    <p>
      Let's highlight some of the behavioural differences between this simulator
      and quantum mechanics (weak Copenhagen interpretation). These
      quasiparticles are not points, and the magntiude in the field does not
      correspond to the probability of their being a particle at that point. One
      would not be able to replicate the double-slit experiment in this
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
