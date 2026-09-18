import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(
        "https://pulse-or4d.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
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
          <p>WELCOME BACK</p>

          <h1>Ready to listen?</h1>

          <span>
            Sign in to create polls and see responses in real time.
          </span>
        </div>

        <form
          className="login-card"
          onSubmit={handleLogin}
        >

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

          {error && (
            <p className="login-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-button"
          >
            Sign In
            <span>→</span>
          </button>

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