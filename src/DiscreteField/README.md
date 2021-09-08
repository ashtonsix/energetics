# Discrete Field Simulator

This is a design document.

There are three substantial opportunities for improvement in the vector field
simulation:

1. Increase max number of concurrent substances from 7 to 12
2. Replace ad-hoc rules for substance interactions with dynamic expressions
3. General tweaks: in naming, reactions, display, and the saved file format

These will enable a greater range of experiments, one could simulate empires,
ants or ambiphilic surfacants for example.

## Default Config (at present)

```js
// prettier-ignore
const defaultConfig = {
  seed: -1,
  size: 150,
  transferRadius: 2,
  substances: [
    {name: 'A', arc: 2 / 3, flo: 0.5},
    {name: 'W', arc: 0.99, flo: 0},
    {name: 'B', arc: 0.999999, flo: 1},
  ],
  substanceAttractionMatrix: {
    A2W: 1,
    B2W: 0,
  },
  reactions: [
    'A -> B, W > 0.0 ? 1.0 : 0.0',
    'B -> A, W > 0.0 ? 0.0 : 1.0'
  ],
}

const defaultSubstance = {
  name: null,
  arc: null,
  arcWeight: 1,
  arcBlending: 0,
  flo: null,
  floWeight: 1,
  floBlending: 0,
  dirWeight: 1,
  dirBlending: 0,
}
```

## New Default Config

- TOML rather than JSON
- rename: tranferRadius -> radius
- rename: arc -> length
- rename: flo -> flow
- rename: energy -> magnitude
- embed display shader (needs more thought)
- embed initialisation
- values for flow, length, direction, and attraction are all small programs,
  written in a custom language
- cannot set name of substances, should be fixed for A through to L (naming
  inconsistency adds too much technical overhead to be worth it for now)

```toml
[global]
seed = -1
size = "interface(size)"
radius = "interface(radius)"

[substances]

[[substances]]
name = "En" # energy
flow = "interface(flow)"
length = "interface(length)"
direction = "En"
attraction = "1"

[[substances]]
name = "W" # wall
flow = "0"
length = "PI"
direction = "W"
attraction = "0"

[[substances]]
name = "Rd" # radiation
flow = "1"
length = "PI"
direction = "Rd"
attraction = "W ? 0 : 1"

[reactions]
reactions = """
# energy becomes radiation in the presence of wall
En -> Rd, W ? 1 : 0

# radiation becomes energy in the absence of wall
Rd -> En, W ? 0 : 1
"""

[initialisation]
initialisation = """
(x, y, size) => {
  let [magnitude, direction] = sample('En.png', x, y, size)
  let [wall] = sample('W.png', x, y, size)
  return {
    A: {magnitude: wall > 0.5 ? 0 : magnitude, direction},
    B: {magnitude: wall > 0.5 ? 1 : 0, direction: random()},
  }
}
"""

[display]
shader = "/magnitude.frag"

[interface]

[[interface]]
name = "length"
label = "Arc Length (degrees)"
type = "input"
min = 0
max = 360
value = 240
decimals = 0
transform = "(value * 2 * PI) / 360"
reverse = "(value * 360) / (2 * PI)"

[[interface]]
name = "radius"
label = "Arc Radius (grid lengths)"
type = "input"
min = 0
max = 20
value = 2
decimals = 2

[[interface]]
name = "flow"
label = "Flow Rate (%)"
type = "input"
min = 0
max = 100
value = 50
decimals = 3
transform = "value / 100"
reverse = "value * 100"
```

## Image format

The image format should be accurate, easily editable, and not look too weird.

At present we use 16 bits for magnitude, 8 bits for direction, and the result
looks too weird, because we use the most significant bits for all three colour
channels.

Let's switch from PNGs with 8-bit depth to PNGs with 16-bit depth (supported by
https://www.npmjs.com/package/pngjs). We will use 32 bits for magnitude (red
channel, + least significant bits from blue channel, + least significant bits
from alpha channel), and 16 bits for direction (green channel). This will make
the images more accurate and less weird-looking.

## Substance Reactions

The reaction rates aren't well-orthogonalised at present. Changing the relative
proportions of reagents affects reactivity, and adding an explosive reaction can
cause other reactions to go slower even if they don't use the same reagents.

Here's what should happen

For a reaction:

```txt
2A + B -> C + D, 0.98
```

The weights should be scaled so `sum(input) = 1` and `sum(output) = 1`, as in:

```txt
0.666(A) + 0.333(B) -> 0.5(C) + 0.5(D), 0.98
```

Then, when we run the reaction, 98% of the bottleneck reagent should be
consumed.

If there's contention for the bottleneck reagent the relevant reactions should
be slowed so that they consume the entirety of the bottleneck reagent.

There's a runtime version of the algorthim I want at /SubstanceReact.ts, the
completed version should be compiled rather than runtime.

## Increasing max number of concurrent substances from 7 to 12

The primary bottleneck is the # of textures that can be created with a single
fragment shader call (8 textures, which can each encode 4 numbers). The current
implementation wastes a lot of this capacity on intermediate values that should
be recalculated rather than cached.

`transferPrepare()` is the flagrant abuser, which uses 4 numbers per texture for
the properties "FWTFS" & "Given" (both vectors). We only need one number per
texture, we can store FWTFS as a scalar and recalculate the direction, flow, and
length inside `transferRun()`. This may even boost performance by cutting down
on texture reads.
