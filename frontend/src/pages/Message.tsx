import React, { useState, useEffect } from "react";
import MessageForm from "../components/MessageForm";
import MessageList from "../components/MessageList";
import { useAuth } from "../components/auth/AuthUserProvider";
import { signInWithGoogle, signOut } from '../firebase';

const Message: React.FC = () => {
  const [messages, setMessages] = useState<{ id: string; message: string }[]>([]);
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);

   // Fetch the user's token on load
   useEffect(() => {
    if (user) {
      user.getIdToken().then((token) => setToken(token));
    } else {
      setToken(null);
    }
  }, [user]);


 // Fetch messages
 useEffect(() => {
  const fetchMessages = async () => {
    if (!token) return; 

    try {
      const response = await fetch("http://localhost:8080/messages", {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      const data = await response.json();
      console.log(data);
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

    fetchMessages();
  }, [token]);

  // Add a new message
  const handleAddMessage = async (message: string) => {
    if (!token) return; 

    try {
      const response = await fetch("http://localhost:8080/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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
    if (!token) return; 

    try {
      await fetch(`http://localhost:8080/messages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      setMessages(messages.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };


  // Edit a message
  const handleEditMessage = async (id: string, updatedMessage: string) => {
    if (!token) return; 

    try {
      await fetch(`http://localhost:8080/messages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
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
      <header>
        {user ? (
          <div>
            <p>Welcome, {user.displayName}</p>
            <button onClick={signOut}>Sign Out</button>
          </div>
        ) : (
          <button onClick={signInWithGoogle}>Sign In with Google</button> 
        )}
      </header>
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
