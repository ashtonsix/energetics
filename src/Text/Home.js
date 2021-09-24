import Introduction from './Introduction'

const Home = () => {
  return (
    <div
      style={{
        padding: '0 30px',
        maxWidth: 'max(min(100vh, 100vw) - 35px, 500px)',
        fontSize: 18,
      }}
    >
      <h1>Energetics and its Applications to Physics</h1>
      <p>This is the website for energetics. Here's the sitemap:</p>
      <ul>
        <li>
          <a href="/introduction">/introduction</a> (you are here)
        </li>
        <li>
          <a href="/discrete-field-simulation">/discrete-field-simulation</a>
          <ul>
            <li>
              <a href="/discrete-field-simulation#text">..#text</a>
            </li>
          </ul>
        </li>
        {/* <li>
          <a href="/discrete-multifield-simulation">
            /discrete-multifield-simulation
          </a>
        </li> */}
        <li>
          <a href="/particle-simulation">/particle-simulation</a> (recommended!)
          <ul>
            <li>
              <a href="/particle-simulation/text">../text</a>
              <ul>
                <li>
                  <a href="/particle-simulation/text/mechanics-detailed">
                    ../mechanics-detailed
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li>
          <a href="/neutron-as-an-ecosystem">/neutron-as-an-ecosystem</a>
        </li>
        {/* <li>
          <a href="/roadmap">/roadmap</a>
        </li> */}
      </ul>
      <p>
        If you want to jump straight into a fun simulation, click one of the
        above links.
        <br />
        If you want to see the source code for this website or any of the
        simulations, go to{' '}
        <a
          href="https://github.com/ashtonsix/energetics"
          target="_blank"
          rel="noopener"
        >
          github.com/ashtonsix/energetics
        </a>
        .<br />
        If you want to learn what this website is all about, keep reading.
      </p>
      <h2>Main Text</h2>
      <Introduction />
    </div>
  )
}

export default Home
