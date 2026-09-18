import { useEffect, useState } from "react";
import "./PollView.css";

function PollView({ pollId }) {
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Check whether this browser has already voted
  useEffect(() => {
    const voted = localStorage.getItem(`voted_${pollId}`);

    if (voted === "true") {
      setHasVoted(true);
      setMessage("You have already voted in this poll.");
    }
  }, [pollId]);

  // Fetch poll results
  const fetchResults = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/polls/${pollId}/results`
      );

      const data = await response.json();

      if (response.ok) {
        setResults(data);
      }
    } catch (error) {
      console.log("Could not load results");
    }
  };

  // Fetch poll
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/polls/${pollId}`
        );

        const data = await response.json();

        if (!response.ok) {
          setMessage(data.error || "Poll not found");
          return;
        }

        setPoll(data.poll);

        fetchResults();
      } catch (error) {
        setMessage("Could not connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [pollId]);

  // WebSocket for live results
  useEffect(() => {
    if (!pollId) {
      return;
    }

    const socket = new WebSocket(
      `ws://localhost:8080/api/polls/${pollId}/ws`
    );

    socket.onopen = () => {
      console.log("Live connection connected");
    };

    socket.onmessage = () => {
      console.log("Poll updated!");

      fetchResults();
    };

    socket.onerror = (error) => {
      console.log("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("Live connection closed");
    };

    return () => {
      socket.close();
    };
  }, [pollId]);

  // Submit vote
  const handleVote = async () => {
    if (hasVoted) {
      setMessage("You have already voted in this poll.");
      return;
    }

    if (!selectedOption) {
      setMessage("Please select an option");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8080/api/polls/${pollId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            optionId: selectedOption,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Could not submit vote");
        return;
      }

      // Remember vote in this browser
      localStorage.setItem(`voted_${pollId}`, "true");

      setHasVoted(true);
      setMessage("Vote submitted successfully! 🎉");

      fetchResults();
    } catch (error) {
      setMessage("Could not connect to server");
    }
  };

  // Copy poll link
  const handleCopyLink = async () => {
    const shareLink = window.location.href;

    try {
      await navigator.clipboard.writeText(shareLink);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.log("Could not copy link");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="loading">
        <h2>Loading poll...</h2>
      </div>
    );
  }

  // Poll not found
  if (!poll) {
    return (
      <div className="not-found">
        <h2>{message || "Poll not found"}</h2>
      </div>
    );
  }

  return (
    <div className="poll-page">
      <div className="poll-container">

        {/* Poll heading */}
        <div className="poll-header">
          <div className="poll-label">PULSE POLL</div>

          <h1>{poll.question}</h1>

          <p className="poll-subtitle">
            Choose an option and submit your vote.
          </p>
        </div>

        {/* Poll card */}
        <div className="poll-card">

          {/* Options */}
          <div>
            {poll.options.map((option) => (
              <label
                key={option.id}
                className={`poll-option ${
                  selectedOption === option.id ? "selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="poll-option"
                  value={option.id}
                  checked={selectedOption === option.id}
                  onChange={(e) =>
                    setSelectedOption(e.target.value)
                  }
                  disabled={hasVoted}
                />

                <span className="poll-option-text">
                  {option.text}
                </span>
              </label>
            ))}
          </div>

          {/* Vote button */}
          <button
            className="vote-button"
            onClick={handleVote}
            disabled={hasVoted}
          >
            {hasVoted ? "Vote Submitted ✓" : "Submit Vote →"}
          </button>

          {/* Message */}
          {message && (
            <p className="vote-message">
              {message}
            </p>
          )}

          {/* Share button */}
          <button
            className="share-button"
            onClick={handleCopyLink}
          >
            {copied ? "✓ Link Copied!" : "↗ Share Poll"}
          </button>

          {/* Results */}
          {results && (
            <div className="results">

              <div className="results-heading">
                <h2>Live Results</h2>

                <span className="total-votes">
                  {results.totalVotes}{" "}
                  {results.totalVotes === 1 ? "vote" : "votes"}
                </span>
              </div>

              {results.results.map((result) => (
                <div
                  className="result"
                  key={result.optionId}
                >
                  <div className="result-info">
                    <span>{result.text}</span>

                    <span>
                      {result.votes} votes ·{" "}
                      {result.percentage.toFixed(1)}%
                    </span>
                  </div>

                  <div className="result-track">
                    <div
                      className="result-fill"
                      style={{
                        width: `${result.percentage}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}

              {/* Live indicator */}
              <div className="live-status">
                <span className="live-dot"></span>
                LIVE RESULTS
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PollView;