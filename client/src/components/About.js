import React from 'react';
import './About.css';

const About = ({ onNavigate }) => {
  return (
    <div className="view-content">
      <div className="about-container">
        <div className="about-section">
          <div className="about-title">THE SITE</div>
          <div className="about-content">
            <p>This site is meant to provide quick, simple, and customizable demonstrations of Stripe's frontend capabilities. It was heavily inspired by <a href="https://4242.io" target="_blank" rel="noreferrer">4242.io</a> and incorporates ideas and influences from many of my amazing colleagues, past and present.</p>
            <p>The source code is available on <a href="https://github.com/fancybeets/stripe-demos" target="_blank" rel="noreferrer">GitHub</a>.</p>
          </div>
        </div>

        <div className="about-section">
          <div className="about-title">THE AUTHOR</div>
          <div className="about-content">
            <div className="author-photo-wrapper">
              <img src="/author-photo.png" alt="Erin Taylor" className="author-photo" />
            </div>
            <p>My name is Erin Taylor and I'm a Technical Solutions Engineer at Stripe. I help developers out with their Stripe integrations. I'm also a big fan of video games, movies, literature, and hanging out with my dog Margot.</p>
            <p>Have feedback, feauture requests, or just wanna get in touch? Email me at <a href="mailto:me@erintaylor.dev">me@erintaylor.dev</a> or add me on <a href="https://www.linkedin.com/in/erin-taylor-99163779/">LinkedIn!</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
