const parse = (reactions: string) => {
  reactions = reactions
    .replace(/#.*/g, '')
    .split('\n')
    .filter((r) => r.trim())
    .join('\n')

  let parsed = reactions.split('\n').map((reaction) => {
    let input = reaction.split('->')[0].trim().split('+')
    let output = reaction.split('->')[1].split(',')[0].trim().split('+')
    let rate = reaction.split('->')[1].split(',')[1].trim()
    let r = {
      input: input.map((s) => {
        const [, quantity, substance] = s.match(/([\d.]*)([A-Za-z]\w*)/)
        return {quantity: +(quantity || '1'), substance}
      }),
      output: output.map((s) => {
        const [, quantity, substance] = s.match(/([\d.]*)([A-Za-z]\w*)/)
        return {quantity: +(quantity || '1'), substance}
      }),
      rate,
    }
    let iq = r.input.reduce((pv, i) => pv + i.quantity, 0)
    let oq = r.output.reduce((pv, o) => pv + o.quantity, 0)
    for (let i of r.input) i.quantity /= iq
    for (let o of r.output) o.quantity /= oq
    return r
  })
  return parsed
}

const evaluate = (
  program: string,
  substances: {[key: string]: number}
): number => {
  for (let k in substances) {
    program = program.replaceAll(k, substances[k].toString())
  }
  // eslint-disable-next-line
  return eval(program)
}

const substanceReact = (
  reactions: string,
  substances: {[key: string]: number}
) => {
  let parsed = parse(reactions)

  // calculate what weight multiplier would use up the desired amount of reagent
  let multipliers = parsed.map((r) => {
    return (
      Math.min(...r.input.map((i) => substances[i.substance] / i.quantity)) *
      Math.max(evaluate(r.rate, substances), 0)
    )
  })

  // calculate how much of each reagent would be used without moderation applied
  let demands = {}
  for (let k in substances) demands[k] = 0
  for (let i in parsed) {
    let r = parsed[i]
    let m = multipliers[i]
    for (let i of r.input) {
      demands[i.substance] += m * i.quantity
    }
  }

  // scale-back reaction rates to reflect what is available
  for (let i in parsed) {
    let r = parsed[i]
    multipliers[i] *= Math.min(
      ...r.input.map((i) => substances[i.substance] / demands[i.substance]),
      1
    )
  }

  // do the reactions
  let inputs = {}
  let outputs = {}
  for (let k in substances) inputs[k] = 0
  for (let k in substances) outputs[k] = 0
  for (let i in parsed) {
    let r = parsed[i]
    let m = multipliers[i]
    for (let i of r.input) {
      inputs[i.substance] += m * i.quantity
    }
    for (let o of r.output) {
      outputs[o.substance] += m * o.quantity
    }
  }

  // TODO: include updates to direction
}

export default substanceReact
