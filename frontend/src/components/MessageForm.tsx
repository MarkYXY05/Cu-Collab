// components/MessageForm.tsx
import React, { useState } from "react";

interface MessageFormProps {
  onAddMessage: (message: string) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({ onAddMessage }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAddMessage(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your message here"
        required
        style={{
          flexGrow: 1,
          padding: "10px",
          fontSize: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
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
        }}
      >
        Post
      </button>
    </form>
  );
};

export default MessageForm;
