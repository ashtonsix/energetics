import React from 'react'

const ExplainerIntro = () => {
  return (
    <>
      <p>
        This is Ashton's particle simulator. It is part of my larger
        investigation into how social systems emerge from physical systems (from
        atoms to justice, from molecules to mercy), and into the commonalities
        shared between social and physical systems. Inspirations for my approach
        include theoretical ecology and daoist philosophy.
      </p>
      <p>
        I designed this simulator for the purpose of exploring inelastic
        collisions. They are interesting because inelastic collisions can create
        correlations between particle trajectories, the same way that
        conversation (collisions between people) can create commonalities
        between people. In the real-world an inelastic collision will always
        convert some kinetic energy into thermal energy, increasing a system's
        disorder and inability to do work, more than compensating for any newly
        created correlations. But in this simulation the kinetic energy is
        always conserved. This twist on inelastic collision allows particles to
        move in a way that violates the second law of thermodynamics, in
        essence, to spontaneously flow from places where pressure is low to
        places where it is high.
      </p>
      <p style={{fontSize: '0.96em'}}>
        <strong>Figure:</strong> Different kinds of collision
      </p>
      <div style={{display: 'flex', justifyContent: 'center'}}>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{height: 200}}
            alt="simple collision 1"
            src="/particle-txt/simple_collision_1.png"
          />
          <p>Before Collision</p>
        </span>
        <span style={{padding: 10, textAlign: 'center', position: 'relative'}}>
          <img
            style={{height: 294, position: 'absolute', top: -50, left: 50}}
            alt="simple collision 2"
            src="/particle-txt/simple_collision_2.png"
          />
          <img alt="" style={{height: 200}}></img>
          <p>Elastic Scattering</p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{height: 200}}
            alt="simple collision 3"
            src="/particle-txt/simple_collision_3.png"
          />
          <p>
            Inelastic Scattering
            <br />
            (Real World)
          </p>
        </span>
        <span style={{padding: 10, textAlign: 'center'}}>
          <img
            style={{height: 200}}
            alt="simple collision 4"
            src="/particle-txt/simple_collision_4.png"
          />
          <p>
            Inelastic Scattering
            <br />
            (Simulation)
          </p>
        </span>
      </div>
      <p style={{fontSize: '0.96em'}}>
        <strong>Figure:</strong> Progression of different inelastic collision
        experiments, starting from random initial states
      </p>
      <img
        alt="inelastic"
        src="/explainer/inelastic.jpg"
        style={{maxWidth: '100%'}}
        loading="lazy"
      />
      <p>
        Although this simulator was designed for exploring inelastic collisions
        it is also a general-purpose particle simulator. I encourage you to play
        around and try things, if you're not sure where to start try replicating
        this figure and go from there:
      </p>
      <p style={{fontSize: '0.96em'}}>
        <strong>Figure:</strong> Dynamical billiards
      </p>
      <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
        <img
          alt="billiards circle"
          src="/explainer/billiards_circle.png"
          style={{maxWidth: 'min(270px, 30%)'}}
          loading="lazy"
        />
        <img
          alt="billiards sinai"
          src="/explainer/billiards_sinai.png"
          style={{maxWidth: 'min(270px, 30%)'}}
          loading="lazy"
        />
        <img
          alt="billiards maze"
          src="/explainer/billiards_maze.png"
          style={{maxWidth: 'min(270px, 30%)'}}
          loading="lazy"
        />
      </div>
    </>
  )
}

export default ExplainerIntro
