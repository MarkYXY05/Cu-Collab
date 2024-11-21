import React, { useState, useEffect } from "react";
import MessageForm from "../components/MessageForm";
import MessageList from "../components/MessageList";

const Message: React.FC = () => {
  const [messages, setMessages] = useState<{ id: string; message: string }[]>([]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("http://localhost:8080/messages");
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  // Add a new message
  const handleAddMessage = async (message: string) => {
    try {
      const response = await fetch("http://localhost:8080/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const newMessage = await response.json();
      setMessages([...messages, { id: newMessage.id, message }]);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (id: string) => {
    try {
      await fetch(`http://localhost:8080/messages/${id}`, { method: "DELETE" });
      setMessages(messages.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // Edit a message
  const handleEditMessage = async (id: string, updatedMessage: string) => {
    try {
      await fetch(`http://localhost:8080/messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: updatedMessage }),
      });
      setMessages(
        messages.map((msg) => (msg.id === id ? { ...msg, message: updatedMessage } : msg))
      );
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  return (
    <div>
      <h1>Messages</h1>
      <MessageForm onAddMessage={handleAddMessage} />
      <MessageList
        messages={messages}
        onDeleteMessage={handleDeleteMessage}
        onEditMessage={handleEditMessage}
      />
    </div>
  );
};

export default Message;
