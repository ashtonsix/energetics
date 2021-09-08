import {useState, useEffect} from 'react'

const MathJaxState = {
  ready: false,
  readyListeners: [],
}
const useMathJax = () => {
  let [MathJax, setMathJax] = useState(
    MathJaxState.ready ? window.MathJax : null
  )

  useEffect(() => {
    if (MathJaxState.ready) return
    MathJaxState.readyListeners.push(() => setMathJax(window.MathJax))
    if (window.MathJax) return
    window.MathJax = {
      tex: {inlineMath: []},
      startup: {
        ready() {
          window.MathJax.startup.defaultReady()
          MathJaxState.ready = true
          MathJaxState.readyListeners.forEach((f) => f())
        },
        pageReady() {},
      },
    }
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js'
    document.body.appendChild(script)
  }, [])

  return MathJax
}

const MathCache = {}
const Tex = ({children, block = false, scale = 1}) => {
  let MathJax = useMathJax()
  let [math, setMath] = useState(null)

  useEffect(() => {
    if (!MathJax) return
    let promise
    let key = (block ? 'block.' : 'inline.') + children
    if (MathCache[key]) promise = MathCache[key]
    else {
      promise = MathJax.tex2svgPromise(children, {display: block}).then((e) => {
        return e.querySelector('svg').outerHTML
      })
      MathCache[key] = promise
    }
    promise.then((math) => {
      // adding <img /> makes equation go blue when highlighted
      let img =
        `<img alt="" ` +
        `src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ` +
        `style="position: absolute; inset: 0px; height: 100%; width: 100%; pointer-events: none;" />`
      setMath(math + img)
    })
  }, [MathJax, children, block])

  return (
    <span style={{position: 'relative', fontSize: scale + 'em'}}>
      <span
        style={{position: 'relative', display: 'inline-block'}}
        dangerouslySetInnerHTML={{__html: math}}
      ></span>
      {/* adding ${children}$ makes it possible to copy-paste equation */}
      <span
        style={
          math
            ? {
                display: 'inline-block',
                position: 'absolute',
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                pointerEvents: 'none',
                opacity: 0,
              }
            : {}
        }
      >
        ${children}$
      </span>
    </span>
  )
}

export default Tex
