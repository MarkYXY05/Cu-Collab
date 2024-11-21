import React, { useState } from "react";

interface GoalFormProps {
  onAddGoal: (goal: string) => Promise<void>;
  placeholder: string; // Placeholder is required
}

const GoalForm: React.FC<GoalFormProps> = ({ onAddGoal, placeholder }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAddGoal(input.trim()); // Call the function to add the goal
      setInput(""); // Reset input field
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder} // Use the placeholder prop
        required
        style={{
          flexGrow: 1,
          padding: "10px",
          fontSize: "1rem",
          borderRadius: "8px",
          border: "1px solid #ccc",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "10px 20px",
          fontSize: "1rem",
          backgroundColor: "#3992ff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Add Goal
      </button>
    </form>
  );
};

export default GoalForm;
