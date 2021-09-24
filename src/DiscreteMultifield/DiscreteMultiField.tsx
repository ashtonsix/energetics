import Interpreter from 'js-interpreter'
import * as acorn from 'acorn'

const DiscreteMultiField = () => {
  const interpreter = new Interpreter('2 * 2')
  console.log(interpreter)
  return (
    <div>
      <input
        onChange={(e) => {
          const tokens = [...acorn.tokenizer(e.target.value, {ecmaVersion: 3})]
          console.log(...tokens)
        }}
      />
    </div>
  )
}

export default DiscreteMultiField
