import {useEffect} from 'react'

const useMathjax = () => {
  useEffect(() => {
    const alreadyLoaded = document.querySelector('#MathJax-script')
    if (alreadyLoaded) {
      window.MathJax.texReset()
      window.MathJax.typesetClear()
      window.MathJax.typesetPromise()
    } else {
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
        // copytext feature taken from https://github.com/mathjax/MathJax/issues/2240
        options: {
          renderActions: {
            addCopyText: [
              156,
              (doc) => {
                if (!doc.processed.isSet('addtext')) {
                  for (const math of doc.math) {
                    window.MathJax.config.addCopyText(math, doc)
                  }
                  doc.processed.set('addtext')
                }
              },
              (math, doc) => window.MathJax.config.addCopyText(math, doc),
            ],
          },
        },
        addCopyText(math, doc) {
          if (math.state() < window.MathJax.STATE.ADDTEXT) {
            const adaptor = doc.adaptor
            const text = adaptor.node('mjx-copytext', {'aria-hidden': true}, [
              adaptor.text(math.start.delim + math.math + math.end.delim),
            ])
            adaptor.append(math.typesetRoot, text)
            math.state(window.MathJax.STATE.ADDTEXT)
          }
        },
        startup: {
          ready() {
            const {newState, STATE} = window.MathJax._.core.MathItem
            const {AbstractMathDocument} = window.MathJax._.core.MathDocument
            const {CHTML} = window.MathJax._.output.chtml_ts
            newState('ADDTEXT', 156)
            AbstractMathDocument.ProcessBits.allocate('addtext')
            CHTML.commonStyles['mjx-copytext'] = {
              display: 'inline-block',
              position: 'absolute',
              top: 0,
              left: 0,
              width: 0,
              height: 0,
              opacity: 0,
            }
            window.MathJax.STATE = STATE
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

      return () => {
        window.MathJax.texReset()
        window.MathJax.typesetClear()
      }
    }
  }, [])
}

export default useMathjax
