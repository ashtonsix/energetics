import React, {useEffect} from 'react'

const Definition = ({label, math}) => (
  <span style={{display: 'block'}}>
    <span style={{display: 'inline-block', minWidth: 110, paddingRight: 8}}>
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
    <div style={{maxWidth: 'calc(max(min(100vh, 100vw) - 65px, 500px))'}}>
      <h2 style={{marginTop: 0}} id="explainer">
        What is this?
      </h2>
      <p>
        This is Ashton's particle simulator. It is part of my larger
        investigation into applications of theoretical ecology to physical
        systems (energetics).
        {/* On a 2019 laptop with a $1,400 retail price */}
      </p>
      <p>This is a particle simulator</p>
      <p>Let's look at the math for collisions</p>
      <p>Starting with some definitions</p>
      <p>About The Creator</p>
      <p>
        I am Ashton Six and am investigating the applications of theoretical
        ecology to physical systems.
      </p>
      <p>
        I want someone to give me money to do more of this. If you or your
        organisation would like to give me money then please contact me at . If
        you give me money I will tell everyone my work was made possible by your
        generosity.
      </p>
      <p>
        I also want comments/advice that may help me improve this work. If you
        have comments to share you could either put them on the internet (eg, on
        Twitter or your blog) and share a link with me, or you can directly{' '}
      </p>
      <p>
        <Definition label="assertion" math={`=`} />
        <Definition label="reassignment" math={`:=`} />
        <Definition label="normalisation" math={`\\overline{x}`} />
        <Definition label="dot product" math={`x \\cdot y`} />
        <Definition label="magnitude" math={`\\|x\\|`} />
        <Definition
          label="mix"
          math={`\\text{mix}(a, b, m) = a(1 - m) + bm, 0 \\le m \\le 1`}
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
        <br />
        <Definition label="elasticity" math={`E`} />
        <Definition
          label="constant velocity"
          math={`V, \\text{True} or \\text{False}`}
        />
      </p>

      <p>Step 0: Get the normal, tangent, and initial momentum</p>
      <p>{`
        $$n = p_0 - p_1$$
        $$t = [-n_y, n_x]$$
        $$\\mathbf{p}_{initial} = m_0\\|v_0\\| + m_1\\|v_1\\|$$
      `}</p>
      <p>Step 1: Translate the particles</p>
      <p>{`
        $$p_0 := p_0 + \\dfrac{r_0 + r_1 - \\|n\\|}{2}$$ 
        $$p_1 := p_1 - \\dfrac{r_0 + r_1 - \\|n\\|}{2}$$ 
        `}</p>
      <p>Step 2: Project the velocities</p>
      <p>{`
        $$v_{0n} = \\overline{n}(\\overline{n} \\cdot v_0)$$
        $$v_{1n} = \\overline{n}(\\overline{n} \\cdot v_1)$$
        $$v_{0t} = \\overline{t}(\\overline{t} \\cdot v_0)$$
        $$v_{1t} = \\overline{t}(\\overline{t} \\cdot v_1)$$
        `}</p>
      <p>
        Step 3: Update the velocities (if {'$E=1$'} and {'$m_0=m_1$'} then this
        just swaps the value of {'$v_{0n}$'} & {'$v_{1n}$'})
      </p>
      <p>{`
        $$v_{0n} := \\frac{E m_1 (v_{1n} - v_{0n}) + m_0 v_{0n} + m_1 v_{1n}}{m_0 + m_1}, \\text{and simultaneously:}$$
        $$v_{1n} := \\frac{E m_0 (v_{0n} - v_{1n}) + m_0 v_{0n} + m_1 v_{1n}}{m_0 + m_1}$$
        $$v_0 := v_{0n} + v_{0t}$$
        $$v_1 := v_{1n} + v_{1t}$$
      `}</p>
      <p>Step 4: Make sure momentum is conserved</p>
      <p>{`
        $$\\mathbf{p}_{current} = m_0\\|v_0\\| + m_1\\|v_1\\|$$
        $$v_0 := v_0\\frac{\\mathbf{p}_{initial}}{\\mathbf{p}_{current}}$$
        $$v_1 := v_1\\frac{\\mathbf{p}_{initial}}{\\mathbf{p}_{current}}$$
      `}</p>
      <p>Step 5: Apply constant velocity</p>
      <p>{`
        $$v_0 := \\left \\{\\begin{aligned}
          &\\overline{v_0}, && \\text{if}\\ V = \\text{True}\\\\
          &v_0, && \\text{otherwise}
        \\end{aligned} \\right.$$
        $$v_1 := \\left \\{\\begin{aligned}
          &\\overline{v_1}, && \\text{if}\\ V = \\text{True}\\\\
          &v_1, && \\text{otherwise}
        \\end{aligned} \\right.$$
      `}</p>
    </div>
  )
}

// vec.setLength(normal, (radii - vec.length(normal)) / 2)
//   vec.$add(p1.position, pushAway)
//   vec.$sub(p2.position, pushAway)

export default Explainer
