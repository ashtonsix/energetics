import {useEffect, useRef} from 'react'

const useInterval = (callback, delay) => {
  const savedCallback = useRef(null)
  const timeout = useRef(null)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    const handler = () => {
      Promise.all([
        new Promise(
          (resolve) => (timeout.current = setTimeout(resolve, delay))
        ),
        savedCallback.current(),
      ]).then(() => handler())
    }

    if (delay !== null) handler()
    return () => clearTimeout(timeout.current)
  }, [delay])
}

export default useInterval
