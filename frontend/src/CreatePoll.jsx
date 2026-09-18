import { useState } from "react";
import "./CreatePoll.css";

function CreatePoll({ onBack }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const updateOption = (index, value) => {
    const updatedOptions = [...options];
    updatedOptions[index] = value;
    setOptions(updatedOptions);
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "https://pulse-or4d.onrender.com/api/polls",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            question,
            options: options
              .filter((option) => option.trim() !== "")
              .map((option) => ({
                text: option.trim(),
              })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Could not create poll");
        return;
      }

      const pollId = data.poll.id;

      const shareLink = `${window.location.origin}/poll/${pollId}`;

try {
  await navigator.clipboard.writeText(shareLink);
  alert(
    `Poll created successfully! 🎉\n\nShare link copied to your clipboard!`
  );
} catch (error) {
  alert(
    `Poll created successfully! 🎉\n\nShare this link:\n${shareLink}`
  );
}
    } catch (error) {
      alert("Could not connect to server");
    }
  };

  return (
    <div className="create-poll-page">
      <div className="create-poll-header">
        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div className="create-brand">
          <span>PULSE</span>
        </div>
      </div>

      <div className="create-poll-container">
        <div className="create-poll-heading">
          <p>CREATE A POLL</p>

          <h1>What do you want to ask?</h1>

          <span>
            Keep it simple. Your audience can respond in seconds.
          </span>
        </div>

        <form
          className="create-poll-card"
          onSubmit={handleCreatePoll}
        >
          <label>Question</label>

          <textarea
            placeholder="e.g. What should we have for lunch?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />

          <label>Options</label>

          {options.map((option, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Option ${index + 1}`}
              value={option}
              onChange={(e) =>
                updateOption(index, e.target.value)
              }
              required
            />
          ))}

          <button
            type="button"
            className="add-option-button"
            onClick={addOption}
          >
            + Add another option
          </button>

          <button
            type="submit"
            className="create-poll-button"
          >
            Create Poll →
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePoll;