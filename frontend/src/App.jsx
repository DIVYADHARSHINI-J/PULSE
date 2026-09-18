import { useState } from "react";
import "./App.css";
import Login from "./Login";
import CreatePoll from "./CreatePoll";
import PollView from "./PollView";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);

  if (showLogin) {
    return <Login onLogin={() => setShowLogin(false)} />;
  }

  if (showCreatePoll) {
    return (
      <CreatePoll onBack={() => setShowCreatePoll(false)} />
    );
  }

  if (window.location.pathname.startsWith("/poll/")) {
    const id = window.location.pathname.split("/poll/")[1];

    return <PollView pollId={id} />;
  }

  return (
    <div className="pulse-app">

      {/* Navigation */}
      <header className="navbar">

        <div className="brand">
          <div className="brand-mark">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <button
            className="pulse-logo-button"
            onClick={() =>
              alert(
                "Why PULSE? ❤️\n\n" +
                "Pulse means the rhythm or heartbeat of something. " +
                "We chose this name because PULSE shows the heartbeat of audience responses — " +
                "votes come in and the results update in real time."
              )
            }
          >
            PULSE
          </button>
        </div>

        <nav className="nav-links">
          <a href="#features">Features</a>

          <a href="#how-it-works">How it works</a>

          <a
            href="#about"
            onClick={() =>
              alert(
                "About PULSE ❤️\n\n" +
                "PULSE is a real-time live polling tool that helps you create polls, " +
                "share them with an audience, and see responses update instantly."
              )
            }
          >
            About
          </a>
        </nav>

        <div className="nav-actions">

          <button
            className="text-button"
            onClick={() => setShowLogin(true)}
          >
            Log in
          </button>

          <button
            className="nav-button"
            onClick={() => setShowCreatePoll(true)}
          >
            Get started
          </button>

        </div>
      </header>

      {/* Hero */}
      <main className="hero">

        <section className="hero-content">

          <div className="eyebrow">
            <span className="status-dot"></span>
            REAL-TIME POLLING
          </div>

          <h1>
            Ask.
            <br />
            <span>Listen.</span>
            <br />
            Understand.
          </h1>

          <p className="hero-text">
            Create simple polls, share them with anyone,
            and watch every response arrive in real time.
          </p>

          <div className="hero-actions">

            <button
              className="primary-button"
              onClick={() => setShowCreatePoll(true)}
            >
              Create your first poll
              <span>→</span>
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              See how it works
            </button>

          </div>

          <div className="hero-note">
            No complicated setup · Share in seconds
          </div>

        </section>

        {/* Poll Preview */}
        <section className="poll-showcase">

          <div className="floating-note note-one">
            <span>✦</span>
            Live responses
          </div>

          <div className="floating-note note-two">
            <span>↗</span>
            128 votes
          </div>

          <div className="poll-card">

            <div className="poll-top">

              <div>
                <span className="live-indicator"></span>
                LIVE POLL
              </div>

              <span className="poll-time">
                Just now
              </span>

            </div>

            <div className="poll-content">

              <p className="poll-label">
                QUICK QUESTION
              </p>

              <h2>
                What helps you focus
                <br />
                the most?
              </h2>

              <PollOption
                text="A quiet environment"
                percentage="46%"
                width="46%"
                selected
              />

              <PollOption
                text="Music"
                percentage="27%"
                width="27%"
              />

              <PollOption
                text="A clear plan"
                percentage="18%"
                width="18%"
              />

              <PollOption
                text="Short breaks"
                percentage="9%"
                width="9%"
              />

            </div>

            <div className="poll-footer">
              <span>● Updating live</span>
              <span>91 responses</span>
            </div>

          </div>

          <div className="soft-circle circle-one"></div>
          <div className="soft-circle circle-two"></div>

        </section>

      </main>

      {/* Features */}
      <section
        id="features"
        className="features"
      >

        <div className="feature">

          <div className="feature-icon sage">
            ↻
          </div>

          <div>
            <h3>Live by default</h3>
            <p>
              Results update as people vote.
            </p>
          </div>

        </div>

        <div className="feature">

          <div className="feature-icon lavender">
            ⌁
          </div>

          <div>
            <h3>Share effortlessly</h3>
            <p>
              One link is all your audience needs.
            </p>
          </div>

        </div>

        <div className="feature">

          <div className="feature-icon peach">
            ♡
          </div>

          <div>
            <h3>Made to feel simple</h3>
            <p>
              Clean screens without unnecessary clutter.
            </p>
          </div>

        </div>

      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="how-it-works"
      >

        <div className="section-heading">

          <p>
            HOW IT WORKS
          </p>

          <h2>
            From question to insight.
          </h2>

        </div>

        <div className="steps">

          <div className="step">

            <span>01</span>

            <h3>
              Create
            </h3>

            <p>
              Write your question and add your options.
            </p>

          </div>

          <div className="step">

            <span>02</span>

            <h3>
              Share
            </h3>

            <p>
              Send your poll link to your audience.
            </p>

          </div>

          <div className="step">

            <span>03</span>

            <h3>
              Watch
            </h3>

            <p>
              See responses change in real time.
            </p>

          </div>

        </div>

      </section>

      {/* About */}
      <section
        id="about"
        className="about-section"
      >

        <div className="section-heading">

          <p>
            ABOUT PULSE
          </p>

          <h2>
            The heartbeat of audience responses.
          </h2>

          <p>
            PULSE makes live polling simple. Create a question,
            share it with your audience, and watch responses
            update in real time.
          </p>

        </div>

      </section>

    </div>
  );
}

function PollOption({
  text,
  percentage,
  width,
  selected
}) {
  return (
    <div className="poll-option">

      <div className="option-info">

        <span
          className={
            selected
              ? "selected-option"
              : ""
          }
        >

          {selected && (
            <span className="check">
              ✓
            </span>
          )}

          {text}

        </span>

        <span>
          {percentage}
        </span>

      </div>

      <div className="option-track">

        <div
          className="option-fill"
          style={{ width }}
        ></div>

      </div>

    </div>
  );
}

export default App;