import Tex from './Tex'

const Roadmap = () => {
  return (
    <div
      style={{
        maxWidth: 'calc(max(min(100vh, 100vw) - 65px, 500px))',
        fontSize: '18px',
      }}
    >
      <h1>Energetics Roadmap</h1>
      <p>
        The energetics project is an amalgamation of everything that interests
        me, with my interpretation of general systems theory at the center of it
        all.
        {/* don't even have a clear answer to
        “What is it?”, beyond “What is it?” */}
      </p>
      <h2>Project Goal</h2>
      <p>Ensure life can thrive for the next infinity years</p>
      <h2>Risks</h2>
      <ol>
        <li>The universe may end</li>
        <li>Humanity may go extinct</li>
      </ol>
      <h2>Project Goals</h2>

      <h2>Philosophy</h2>
      <ol>
        <li>
          Rebuttal to the anthropic principle. Life will emerge in any universe
          that approximately conserves disorder given enough time and space.
          Because the complexity of any suffciently large isolated system is
          garunteed to compound exponentially (hint: 1% growth per billion years
          is exponential). This is the "life finds a way" principle.
        </li>
      </ol>
      <h2>Case Studies</h2>
      <p>
        I am most-interested in making contributions to physics, general systems
        theory, and philosophy. That said, I have studied widely, have a number
        of secondary interests, and formed relevant hypothesis to test the
        predictive capability of the energetics framework. Although only
        intended as tests they may be of interest to some in themselves. Two are
        presented.
      </p>
      <h3>Hypothesis 1 (Neuroscience)</h3>
      <p>
        All symptoms of autism spectrum and borderline personality disorders
        have a single root cause: impaired gaze perception. Whether a person
        exhibits symptoms more stereotypical of autism spectrum or borderline
        personality disorders depends on the strategy they use to cope with this
        impairment.
        {/* "give up" strategy leads to autism spectrum disorder,
        whereas a "double-down" strategy leads to borderline personality
        disorder. */}
      </p>
      <p>Imagine </p>
      <h3>Thesis 2 (History)</h3>
      <p>
        Why was European Imperialism so successful from 1493 (Inter Caetera) to
        1917 (peak of the German Empire's economy)
      </p>
      <p>European Expansion</p>
      <ol>
        <li>
          Each flow wants to become a Langrangian where <Tex>{`A=B`}</Tex>.
        </li>
        <li>
          Any centripetal-like force will minimise disorder locally, a decrease
          in local disorder may increase global disorder.
          {/* As an optimisation
          process, disorder is only decreased locally. Local decreases in
          disorder can increase global disorder. */}
        </li>
        <li>Model as evolving phase space</li>
        <li>Generalise beyond </li>
        <li>I want to write ten thousand more pages but don't have time.</li>
      </ol>
    </div>
  )
}

export default Roadmap
