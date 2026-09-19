import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const endpoint = isSignup
        ? "https://pulse-or4d.onrender.com/api/auth/signup"
        : "https://pulse-or4d.onrender.com/api/auth/login";

      const body = isSignup
        ? {
            name,
            email,
            password,
          }
        : {
            email,
            password,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (isSignup) {
        setSuccess("Account created successfully! Please sign in.");

        setIsSignup(false);
        setPassword("");
        setName("");

        return;
      }

      localStorage.setItem("token", data.token);

      onLogin();
    } catch (error) {
      setError("Could not connect to server");
    }
  };

  return (
    <div className="login-page">
      <div className="login-decoration decoration-one"></div>
      <div className="login-decoration decoration-two"></div>

      <div className="login-content">
        <div className="login-brand">
          <div className="login-brand-mark">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <span>PULSE</span>
        </div>

        <div className="login-heading">
          <p>{isSignup ? "CREATE ACCOUNT" : "WELCOME BACK"}</p>

          <h1>
            {isSignup ? "Ready to join?" : "Ready to listen?"}
          </h1>

          <span>
            {isSignup
              ? "Create an account to start making live polls."
              : "Sign in to create polls and see responses in real time."}
          </span>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          {isSignup && (
            <div className="input-group">
              <label>Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="input-group">
            <label>Email address</label>

            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="login-error">{error}</p>}

          {success && <p className="login-success">{success}</p>}

          <button type="submit" className="login-button">
            {isSignup ? "Sign Up" : "Sign In"}
            <span>→</span>
          </button>

          <div className="login-switch">
            <span>
              {isSignup
                ? "Already have an account?"
                : "Don't have an account?"}
            </span>

            <button
              type="button"
              className="switch-button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
                setSuccess("");
              }}
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </div>

          <div className="login-footer">
            <span>Simple questions.</span>
            <span>Real responses.</span>
          </div>
        </form>

        <p className="login-bottom-text">
          PULSE · Real-time polling made simple
        </p>
      </div>
    </div>
  );
}

export default Login;