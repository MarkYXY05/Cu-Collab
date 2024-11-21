import React, { useState } from "react";

interface MessageListProps {
  messages: { id: string; message: string }[];
  onDeleteMessage: (id: string) => void;
  onEditMessage: (id: string, updatedMessage: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, onDeleteMessage, onEditMessage }) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editInput, setEditInput] = useState<string>("");

  const handleEditClick = (index: number, message: string) => {
    setEditingIndex(index);
    setEditInput(message);
  };

  const handleSaveClick = (id: string) => {
    onEditMessage(id, editInput);
    setEditingIndex(null);
  };

  return (
    <div>
      {messages.map((message, index) => (
        <div
          key={message.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
          }}
        >
          {editingIndex === index ? (
            <input
              type="text"
              value={editInput}
              onChange={(e) => setEditInput(e.target.value)}
              style={{
                flexGrow: 1,
                marginRight: "10px",
                padding: "5px",
              }}
            />
          ) : (
            <span>{message.message}</span>
          )}
          <div>
            {editingIndex === index ? (
              <button
                onClick={() => handleSaveClick(message.id)}
                style={{
                  marginRight: "10px",
                  backgroundColor: "green",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "8px",
                }}
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => handleEditClick(index, message.message)}
                style={{
                  marginRight: "10px",
                  backgroundColor: "blue",
                  color: "white",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "8px",
                }}
              >
                Edit
              </button>
            )}
            <button
              onClick={() => onDeleteMessage(message.id)}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "8px",
              }}
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
