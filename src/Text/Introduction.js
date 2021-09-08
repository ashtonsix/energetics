import React from 'react'
import Tex from '../Particles/Tex'

const Introduction = () => {
  return (
    <div>
      <p>
        My goal is to ensure that life can thrive for the next infinity years.
        It is said that the universe will end someday, this is my biggest
        obstacle ahead, and I am tackling it in earnest.
      </p>
      <p>
        Thermodynamics lies at the center of this impending cataclysm. Energy
        itself is not the source of life. The true source of life is the
        movement of energy, the flow from places where it is hot to those where
        it is cold—
        <wbr />a difference in energy. With every movement, it is said, that hot
        and cold mix a little more, pulling us inevitably and irreversibly
        towards ultimate death—
        <wbr />
        universal room temperature.
      </p>
      <p>
        This prophecy is considered to be fact by most. However I will argue
        it’s nothing but an absolutely and completely baseless myth. In its
        theoretical foundations is an implicit assumption that has seemingly
        escaped critical attention, and that I believe is false. If I’m correct
        the universe is saved (or rather, was never in danger).
      </p>
      <p>
        To get technical, the second law of thermodynamics defines a term called
        entropy, which describes A) how much useless energy there is, and B) how
        much disorder there is. The implication being that “useless” and
        “disordered” are equivalent traits. To connect this with death, useless
        energy cannot sustain life, and we would describe energy as disordered
        if it was all mixed up (like hot and cold).
      </p>
      <p>
        Just to clarify how “disordered” and “mixed up” are equivalent, we mean
        “mixed up” as in “shuffled together” rather than “blended”. The colour
        of a television, turned to a dead channel.
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{width: 222, padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/introduction/img_disorder_low.png"
          />
          <p>Low Disorder</p>
        </span>
        <span style={{width: 222, padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #2"
            src="/introduction/img_disorder_high.png"
          />
          <p>
            High Disorder /<br />
            “Shuffled Together”
          </p>
        </span>
        <span style={{width: 222, padding: 10, textAlign: 'center'}}>
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #3"
            src="/introduction/img_disorder_blended.png"
          />
          <p>
            <br />
            “Blended”
          </p>
        </span>
      </div>
      <p>
        The second law of thermodynamics states that the world’s total entropy
        will increase whenever something happens, which is what makes ultimate
        death inevitable. To understand where this supposed guarantee comes from
        we need to get a bit more in-depth with our definition of disorder by
        looking at information, reversibility and redoability.
      </p>
      <p>
        Information is one of the accepted formal definitions of disorder, it’s
        the length of the shortest possible description that can exactly
        reproduce a thing. To help with our understanding let’s realise that
        finding this description is the essential goal of digital compression.
        So we can estimate an upper bound for how much disorder there is, in
        bits, for any digital file by compressing it and looking at the
        filesize. Less disordered files are generally easier to compress.
      </p>
      <p>With images (png compression, originally 40000 bits):</p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span
          style={{
            display: 'inline-block',
            width: 222,
            padding: 10,
            textAlign: 'center',
          }}
        >
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #1"
            src="/introduction/img_disorder_low.png"
          />
          <p>
            888 bits
            <br />
            2.22% of original
            <br />(
            <a href="/introduction/img_disorder_low.png" download>
              download
            </a>
            )
          </p>
        </span>
        <span
          style={{
            display: 'inline-block',
            width: 222,
            padding: 10,
            textAlign: 'center',
          }}
        >
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #2"
            src="/introduction/img_disorder_high.png"
          />
          <p>
            42192 bits
            <br />
            105.48% of original
            <br />(
            <a href="/introduction/img_disorder_high.png" download>
              download
            </a>
            )
          </p>
        </span>
        <span
          style={{
            display: 'inline-block',
            width: 222,
            padding: 10,
            textAlign: 'center',
          }}
        >
          <img
            style={{padding: 10, border: '1px solid #ccc'}}
            alt="Example #3"
            src="/introduction/img_disorder_mid.png"
          />
          <p>
            7896 bits
            <br />
            19.74% of original
            <br />(
            <a href="/introduction/img_disorder_mid.png" download>
              download
            </a>
            )
          </p>
        </span>
      </div>
      <p>With text (7z compression, originally 40000 bits):</p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span
          style={{
            display: 'inline-block',
            width: 222,
            padding: 10,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              display: 'flex',
              placeItems: 'center',
              padding: 10,
              margin: 0,
              border: '1px solid #ccc',
              width: 200,
              height: 200,
              fontSize: 22,
            }}
          >
            “Bah_” repeated 5000 times, as in:
            <br />
            <br />
            “Bah_
            <wbr />
            Bah_
            <wbr />
            Bah_
            <wbr />
            Bah_
            <wbr />
            Bah…”
          </p>
          <p>
            1640 bits
            <br />
            4.10% of original
            <br />(
            <a href="/introduction/text_disorder_low.7z" download>
              download
            </a>
            )
          </p>
        </span>
        <span
          style={{
            display: 'inline-block',
            width: 222,
            padding: 10,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              display: 'flex',
              placeItems: 'center',
              padding: 10,
              margin: 0,
              border: '1px solid #ccc',
              width: 200,
              height: 200,
              fontSize: 22,
            }}
          >
            The previous text shuffled with Fisher-Yates, as in:
            <br />
            <br />
            “a___
            <wbr />
            a_
            <wbr />
            h_
            <wbr />
            Bh_
            <wbr />
            Bah_
            <wbr />
            hBaaaBBaBBaaBhh_
            <wbr />
            hh_
            <wbr />
            hh__
            <wbr />
            B__
            <wbr />
            aha_
            <wbr />
            a...”
          </p>
          <p>
            48128 bits
            <br />
            120.32% of original
            <br />(
            <a href="/introduction/text_disorder_high.7z" download>
              download
            </a>
            )
          </p>
        </span>
        <span
          style={{
            display: 'inline-block',
            width: 222,
            padding: 10,
            textAlign: 'center',
          }}
        >
          <p
            style={{
              display: 'flex',
              placeItems: 'center',
              padding: 10,
              margin: 0,
              border: '1px solid #ccc',
              width: 200,
              height: 200,
              fontSize: 19,
            }}
          >
            The first 5000 characters of the Tao Te Ching, translated to English
            by Tolbert McCarroll, as in:
            <br />
            <br />
            “The Tao that can be spoken of is not the eternal Tao…”
          </p>
          <p>
            18600 bits
            <br />
            46.5% of original
            <br />(
            <a href="/introduction/text_disorder_mid.7z" download>
              download
            </a>
            )
          </p>
        </span>
      </div>
      <p>
        Any state in complete order or complete disorder is incapable of holding
        a signal, for both are forms of nothingness, dull and boring and
        lifeless. Everything worth living for lies between these two extremes,
        cannot exist without both order and disorder, Apollo and Dionysus, light
        and dark. If it can be shown, as the second law of thermodynamics
        claims, that the amount of information in the world increases every time
        something happens that means we are heading unavoidably towards complete
        disorder, to a horrible extreme. This is where reversibility and
        redoability come in.
      </p>
      <p style={{borderLeft: '4px solid #999', paddingLeft: 20}}>
        <strong>Note:</strong> There are two common definitions of information
        in science literature but they are not even slightly interchangeable.
        The one we just introduced originates with Andrey Kolmogorov. The other
        originates with Claude Shannon and Ludwig Boltzmann. To eliminate
        ambiguity, when we write “information” that always refers to
        Kolmogorov's information, when we write “signal” that always refers to
        Shannon's information.
      </p>
      <p>
        If we were to take the two best theories from physics, quantum mechanics
        and general relativity, and naively pop them into a single equation we
        will get something that is reversible and non-redoable. And, if that
        equation were to perfectly prescribe what happens in nature, that means
        everything that happens in nature is also reversible and non-redoable.
      </p>
      <p>
        To give an example of a reversible and non-redoable equation let's look
        at <Tex>{`f(\\{x\\}) = \\{x, P(0, 10)\\}`}</Tex>, where{' '}
        <Tex>{`P(0, 10)`}</Tex> represents a random number between 0 and 10, as
        in <Tex>{`f(\\{3\\})\\text{ }({=})^{p{=}8}\\text{ }\\{3, 8\\}`}</Tex>.
        We can reverse <Tex>{`f(\\{x\\})`}</Tex> with{' '}
        <Tex>{`f^{-1}(\\{x, y\\}) = \\{x\\}`}</Tex>, which is to say{' '}
        <Tex>{`f^{-1}(f(\\{x\\})) = \\{x\\}`}</Tex>; but we cannot redo{' '}
        <Tex>{`f(\\{x\\})`}</Tex> since it gives a random result every time we
        apply it, which is to say <Tex>{`f(\\{x\\}) ≉ f(\\{x\\})`}</Tex> and{' '}
        <Tex>{`\\{x, y\\} ≉ f(f^{-1}(\\{x, y\\})) \\ne`}</Tex>{' '}
        <Tex>{`f^{-1}(f(\\{x\\}))`}</Tex>. In quantum mechanics and general
        relativity the non-redoability comes from uncertainty, the cat-in-a-box;
        and the reversibility comes from a bit of mathematical logic (Emmy
        Noether's theorem).
      </p>
      <p style={{borderLeft: '4px solid #999', paddingLeft: 20}}>
        <strong>Note:</strong> In a formal setting one would usually write
        “deterministic” and “commutative” rather than “redoable”.
      </p>
      <p>
        To connect reversibility and redoability with disorder, if we have a
        reversible and redoable equation (like those found in classical
        mechanics), <Tex>{`g(x)`}</Tex>, and apply it or its reverse{' '}
        <Tex>{`t`}</Tex> times, as in <Tex>{`g^{\\circ t}(x_i)`}</Tex> or{' '}
        <Tex>{`g^{\\circ -t}(x_i)`}</Tex>, then logically, the amount of
        disorder in <Tex>{`x_i`}</Tex> will not change. That's because the
        shortest possible description of <Tex>{`x_j`}</Tex> will always be{' '}
        <Tex>{`g^{\\circ t}(x_i)`}</Tex> (so long as we ignore the length of{' '}
        <Tex>{`g(x)`}</Tex>'s defintion and <Tex>{`t`}</Tex>'s value), where{' '}
        <Tex>{`t`}</Tex> depends on <Tex>{`x_j`}</Tex>, and <Tex>{`x_i`}</Tex>{' '}
        is the smallest member of <Tex>{`X`}</Tex>, where “smallest” means “that
        which contains the least information”. <Tex>{`x_t`}</Tex> represents the
        state of the universe at time <Tex>{`t`}</Tex>. So if nature is
        reversible and redoable we're not heading to either complete order or
        complete disorder, but rather, staying completely still, moving in
        neither direction. Here's a color unmixing machine that may help one
        understand what this means in practice (from Smarter Every Day):{' '}
        <a
          target="_blank"
          rel="noopener"
          href="https://www.youtube.com/watch?v=j2_dJY_mIys"
        >
          youtube.com/watch?v=j2_dJY_mIys
        </a>
        .
      </p>
      <p>
        To consider the equations used by quantum mechanics and general
        relativity, let's now look at how reversible and non-redoable equations
        affect disorder. In short, applying <Tex>{`f(x)`}</Tex> to{' '}
        <Tex>{`x_i`}</Tex> will always increase the disorder of{' '}
        <Tex>{`x_i`}</Tex> (by an amount <Tex>{`\\ge 0`}</Tex>), whereas
        applying <Tex>{`f^{-1}(x)`}</Tex> will always decrease the disorder of{' '}
        <Tex>{`x_i`}</Tex> (by an amount <Tex>{`\\ge 0`}</Tex>). That's because
        in order to reverse <Tex>{`f(x)`}</Tex> one must keep track of all the
        uncertainties that <Tex>{`f(x)`}</Tex> introduces, and this is where the
        extra information comes from; and to address the reverse,{' '}
        <Tex>{`f^{-1}(x)`}</Tex> must forget any uncertainties introduced by{' '}
        <Tex>{`f(x)`}</Tex>. There's a more formal explanation for this in Ämin
        Baumeler and Stefan Wolf's 2018 paper,{' '}
        <a
          target="_blank"
          rel="noopener"
          href="https://arxiv.org/pdf/1602.06987.pdf"
        >
          Can Space-Time Be Based on Logic and Computation?
        </a>
        , which is where I originally got the idea to connect reversibility and
        disorder. And so, it is mathematically provable that we are doomed to
        desolation in the case where quantum mechanics and general relativity
        are 100% accurate.
      </p>
      <p>
        Our chance at salvation depends upon the fact we don't yet understand
        everything. What happens beyond a black hole's event horizon, for
        example, is a total mystery to physics. Not only is it outside the range
        of what quantum mechanics and general relativity are able to describe,
        but crossing an event horizon is also the only truly irreversible
        process we know of in the natural world
        <a
          style={{textDecoration: 'none'}}
          href="https://physics.stackexchange.com/questions/380385/do-black-holes-violate-t-symmetry"
          target="_blank"
          rel="noopener"
        >
          *
        </a>
        . Furthermore, so long as the no-hair theorem is correct, one can
        exactly describe (the observable surface of) a black hole with just two
        short numbers: mass and angular momentum
        <a
          style={{textDecoration: 'none'}}
          href="https://en.wikipedia.org/wiki/No-hair_theorem"
          target="_blank"
          rel="noopener"
        >
          *
        </a>
        . So, can black holes destroy information? Can they bring us back from
        the precipice of disaster? Can they sustain life for the next infinity
        years?
      </p>
      <p style={{borderLeft: '4px solid #999', paddingLeft: 20}}>
        <strong>Hold up:</strong> Let's get clear about some definitions before
        we continue. In our theoretical framework, energy is the exact
        description of a thing (indistinguishable from a thing in itself).
        Disordered energy (or just “disorder”) is a thing's shortest possible
        description, which could be a reference to some other identical thing;
        the collection of all referenceable information is a “world” or
        “universe” (global), or “context” or “umwelt” (local); disorder is what
        makes something unique. Entropy is left undefined, deliberately. Exergy
        is a thing's redundant information, what makes it similar to other
        things, and to what extent its parts are self-similar; in essence,
        energy minus disorder, order.
        <br />
        <br />
        <strong>Philosophy:</strong> To have value within a given context, a
        thing must share information with other things in that context (exergy),
        and simultaneously be unique in its own way (disorder). If a thing is
        unique, in part, because of its relationship to a person, that thing is
        likely valuable to the person and vice-versa; whether that thing be an
        object, other person, concept, or story. A life lived for others is a
        life worthwhile, I am because we are (
        <a href="https://en.wikipedia.org/wiki/Ubuntu_philosophy">Ubuntu</a>,{' '}
        <a href="https://en.wikipedia.org/wiki/Prat%C4%ABtyasamutp%C4%81da">
          Pratītyasamutpāda
        </a>
        ).
      </p>
      <p>
        The first thing we ought to try is putting some energy into a black
        hole, pulling it back out again, and seeing if it's any less disordered.
        So, let's throw a teapot in. The teapot should increase the black hole's
        angular momentum and mass, both forms of energy. The amount of mass
        added will be <Tex>{`\\ge`}</Tex> the teapot's initial disorder, and the
        amount of angular momentum added will be <Tex>{`\\le`}</Tex> the
        teapot's initial exergy. We can pull the angular momentum out with
        gravitational slingshots, and that energy should be immediately useful.
        And the mass should slowly leak out via Hawking radiation which, as a
        form of black-body radiation will, unfortunately, be completely
        disordered. In essence the in-and-out approach moves energy around
        without actually achieving anything, destroying the teapot's signal but
        not its information, not its disorder. Bummer.
      </p>
      <p>
        I do not believe stellar black holes are of practical use to us.
        Stellars are not, however, the only kind of black holes around. Energy
        density is the key ingredient for any black hole, an ingredient that can
        be found in the cores of collapsing stars and, it is postulated, at the
        other end of the universe. Not left or right but straight down. At
        scales far smaller than the atom, in the quantum foam, where the very
        fabric of space bubbles and fluctuates chaotically and forms what are
        known as virtual particles: short-lived things that pop in and out of
        existence. Some of which, we call virtual black holes.
      </p>
      <p>
        Let's play pretend, and say these virtual particles form a kind of black
        hole soup. And as we delve deeper into nature's smallest scales the soup
        thickens due to a growing density of black holes. Grows until the black
        hole pressure reaches a critical threshold where the structure of space
        undergoes a phase transition and becomes crystal-like, where it
        resembles the lattices of graphene and diamond. Here, at the very
        smallest scale of the universe appears a quantity known as the Planck
        volume, a volume that cannot be subdivided in any meaningful way and
        contains exactly one unit of energy. Each Planck volume is essentially a
        tiny black hole, that we can exactly describe with a few short numbers
        and that, colloquially, we may refer to as a pixel. It is my suspicion
        that dynamic irregularities in the structure of this hypothetical pixel
        lattice are the source of the quantum foam and, ultimately, everything
        that may be found in nature—
        <wbr />
        of every particle, waterfall, planet and person.
      </p>
      <p>
        Let's consider disorder in the context of these pixels. Imagine a “sound
        wave” travelling through the pixels, causing the pixels to squish and
        spread apart as it passes. We'll use a discrete vector field to
        represent the pixels, where each vector indicates the passing wave's
        direction and magntiude (drawn below). The wave's motion is
        mathematically irreversible. Wherever a large number of pixels affect a
        smaller number of pixels we find there's simply not enough space to
        store the signal, and so something has to give way. The wave both
        creates and destroys information. QED.
      </p>
      <img
        style={{maxWidth: '100%', padding: 10, border: '1px solid #ccc'}}
        alt="vector"
        src="/introduction/discrete_field_1.png"
      />
      <p>
        Black hole soup and pixelated waves only come from my imagination.
        However, they could plausibly describe nature. Below a certain scale,
        about the radius of a proton, physics becomes more like guesswork than
        science. For at these scales especially, the journey that separates the
        point where an idea is conceived from the point where it's veracity can
        be substantiated is long and ardous and rarely completed. And until we
        have a verifiable theory, a theory of quantum gravity, that can shed
        light on these hidden physics we will not have a verifiable answer to
        the question: “Does every action cause an increase in disorder”? It is
        often assumed “yes” but, for now, that question can only be answered
        with guesswork. And that is why the ultimate death propehcy is nothing
        more than a baseless myth.
      </p>
      <p>
        The definition of disorder we've explored, the shortest possible
        description of a thing, may seem esoteric and highfalutin. So it's fair
        to ask “Do physics that decrease a thing's shortest possible description
        actually lead to qualitative and immediately recognisable decreases in
        disorder”? I'm glad you asked. The answer is yes.
      </p>
      <p>
        When we pop the pixelated wave physics into a simulator and run it, from
        random initial states there emerge quasiparticles similar to those
        modelled by quantum field theory:
      </p>
      <div style={{textAlign: 'center'}}>
        <img
          style={{maxWidth: '100%', padding: 10, border: '1px solid #ccc'}}
          alt="vector"
          src="/introduction/discrete_field_2.png"
        />
        <p>
          See this simulator and details on its mechanics at{' '}
          <a href="/discrete-field-simulation/basic">
            /discrete-field-simulation/basic
          </a>
          <br />
          Left: Wave magnitude from a pixelated wave experiment at{' '}
          <Tex>{`t=∞`}</Tex> <br />
          Right: Difference in wave magnitude for <Tex>{`t=∞`}</Tex> vs{' '}
          <Tex>{`t=∞{-}1`}</Tex>
        </p>
      </div>
      <p>
        When we simulate inelastic particle collisions with conserved kinetic
        energy, another interaction that both destroys and creates information,
        the particles spontaneously line up with each other like this:
      </p>
      <div style={{textAlign: 'center'}}>
        <img
          style={{maxWidth: '100%', padding: 10, border: '1px solid #ccc'}}
          alt="vector"
          src="/introduction/particles.jpg"
        />
        <p>
          See this simulator in-action at{' '}
          <a href="/particles-simulation">/particles-simulation</a>
          <br />
          See an in-depth analysis of this simulator at{' '}
          <a href="/particles-text">/particles-text</a>
        </p>
      </div>
      <p>
        We get similar results with network-based simulations that destroy
        information too, although I haven't made any of these available, since I
        made them at a time when I was less familliar with the underlying
        concepts and their quality is dubious. I hope to soon remake one of
        these with all of my new knowledge incorporated into the design. With
        this simulator I will be able to explore how pixels bend and pull each
        other, and that might provide some clues regarding where gravity and
        dimensions come from.
      </p>
      <p>
        So there are definitely hypothetical physics where the second law of
        thermodynamics doesn't work. Are there real-world experiments that would
        give one room to doubt its legitimacy? Well, yes. In February 2020,
        researchers at the University of Arkansas observed that sheets of
        graphene wobble up-and-down when at thermal equilbrium and built a
        contraption to harvest exergy from those wobbles (
        <a
          target="_blank"
          rel="noopener"
          href="https://arxiv.org/pdf/2002.09947.pdf"
        >
          Fluctuation-Induced Current From Freestanding Graphene
        </a>
        ). In two more-recent studies, one from July 2021 and another from
        August 2021, researchers described what they call discrete time
        crystals, quantum thingamajigs that demonstrate the same
        disorder-reducing behaviour as my pixelated wave simulator (
        <a href="https://www.quantamagazine.org/first-time-crystal-built-using-googles-quantum-computer-20210730/">
          Eternal Change for No Energy: A Time Crystal Finally Made Real
        </a>
        ).
      </p>
      <p>
        So, the second law of thermodynamics might be wrong. Entropy might not
        exist (no such thing as useless energy). So what? How will this affect
        people alive today? And if the laws of thermodynamics are incorrect what
        will replace them? Good questions. In my research, that I hope to
        release more of soon, and with what has been demonstrated as the
        foundation, I have discovered new physics, new philosophy, and new ways
        to expand general systems theory... And it is to my great regret that I
        cannot adequately sumrise those discoveries here. I've spent so long
        trying to find the right words for an introduction but everything I've
        come up with is too long and complicated. It's so frustrating!
      </p>
      <p>
        Okay. So basically, I started with abstract questions like “Why are
        things they way they are?”, came up with very specific answers, studied
        widely, revised the answers every time I found some counter-example or
        contradiction, and got to something that felt interesting after ten-ish
        years of iteration. Universal axioms that hold whether one is talking
        about microbiology, communication, computer code, history, love, or
        whatever. And even at that level of generality, can actually lead one to
        accurate and useful predictions. Usually done to best effect by
        augmenting domain-specific skills and knowledge. The texts I found
        most-useful in this endeavour included Ecology by Robert Ulanowicz, and
        Dynamics in Action by Alicia Juarrero.
      </p>
      <p>
        So I have this frankenstein theory that I call energetics. It takes a
        bit of anthropology, a bit of statistical mechanics, a bit of
        this-and-that. There's a few books worth of good stuff in there. Laws of
        energy and motion, practical notes on designing resilient systems,
        reflections on the nature of freewill. That kinda thing, general systems
        theory and philosophy. It ties together the work from lots of smart
        people who aren't normally put in the same category.
      </p>
      <p>
        Then, when it came to physics, I just kept looking into what caught my
        attention and applying my general knowledge to it. Like, here's how my
        trains of thought would go:
      </p>
      <ul>
        <li>
          Hmm... the inverse of the fine structure constant is almost a prime
          number, does that have something to do with resonance? Like, a lack of
          resonance causes protons and electrons to stick together? Like, how
          gears without teeth would just slide past each other? What effect
          might that “magnetic friction” have on photonic flux tubes?
        </li>
        <li>
          Hmm... do flux tubes expand when they're too stable? Can we express
          that in terms of disorder and constraints? What about the weak force?
          Is beta-decay expressible as a general systems collapse followed by
          return to equilibrium? Is there a simpler alternative to quantum
          chromodynamics and electrodynamics here?
        </li>
        <li>
          Hmm... since galaxies are so isolated could they all be in quantum
          superposition relative to each other? Could there be a link between
          that and dark energy? Does space always expand when it's isolated?
          Does isolation make space more stable?
        </li>
        <li>
          Hmm... if the fabric of space is a network, would that imply there's a
          link between the structure of space and the the Wigner-May-Ulanowicz
          stability threshold for effective connectance? (
          <Tex>{`e^{3 / e} ≈ 3.015`}</Tex>,{' '}
          <a
            target="_blank"
            rel="noopener"
            href="https://people.clas.ufl.edu/ulan/files/Venice.pdf"
          >
            Limitations on the Connectivity of Ecosystem Flow Networks
          </a>
          )
        </li>
        <li>
          Hmm... what if all entangled particles are actually touching and only
          appear to be seperated by distance? Could their entanglement remain
          stable if we only read/write <Tex>{`\\le`}</Tex> 0.015 bits of data to
          the spin? Would reading the same bit repeatedly and doing error
          correction enable FTL communication? (If yes, 2200 redundant reads per
          bit to send 100GB with 99.7% confidence the recieved message has no
          errors,{' '}
          <a
            target="_blank"
            rel="noopener"
            href="https://www.desmos.com/calculator/7dg8annrmx"
          >
            desmos.com/calculator/7dg8annrmx
          </a>
          )
        </li>
      </ul>
      <p>
        And after a few thousand “hmms” I think I might have something
        interesting on that side of things too. It just... reads as a bit
        off-the-rails right now. Unsubstantiated. I'm creating software
        simulations to try and test my ideas, to see whether they have any real
        meat to them, but there's just so much work ahead. It feels overwhelming
        sometimes.
      </p>
      <p>
        Anyway, to introduce myself, I'm Ashton Six. I want to dedicate the rest
        of my life to doing and sharing research, as I think that's where I can
        have the most impact on the “ensure that life can thrive for the next
        infinity years” thing. I'm a software engineer by profession. I have no
        university education, no funding, no affiliation to any institution, no
        professional peers in science. If you've read this and looked at my
        simulations, thank you! If you think you can advise me in any way, help
        me take my first steps into professional research, then please contact
        me at{' '}
        <a target="_blank" rel="noopener" href="mailto:me@ashtonsix.com">
          me@ashtonsix.com
        </a>
        . Thank you.
      </p>
      <p>
        And if you just want to stay up-to-date with my research send me an
        email and I'll pop you onto a list.
      </p>
    </div>
  )
}

export default Introduction
