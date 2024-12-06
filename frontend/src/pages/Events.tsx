import React, { useState, useEffect } from "react";
import { useAuth } from "../components/auth/AuthUserProvider";
import { Center } from "@mantine/core";

interface Event {
  id?: string; 
  title: string;
  time: string;
  location?: string;
  description?: string;
}

const Events: React.FC = () => {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Event>({
    title: "",
    time: "",
    location: "",
    description: "",
  });
  const [showExitPrompt, setShowExitPrompt] = useState(false);

  // Fetch token on user login
  useEffect(() => {
    if (user) {
      user.getIdToken().then((token) => setToken(token));
    } else {
      setToken(null);
    }
  }, [user]);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      if (!token) return;

      try {
        const response = await fetch("http://localhost:8080/events", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setEvents(data); // Populate events from backend
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [token]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  // Save the event to backend
  const handleSave = async () => {
    if (!token) {
      alert("You must be signed in to save an event!");
      return;
    }
  
    if (newEvent.title && newEvent.time) {
      try {
        console.log("Saving event:", newEvent); // Debugging log
        const response = await fetch("http://localhost:8080/events", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newEvent),
        });
  
        if (!response.ok) {
          throw new Error("Failed to save event");
        }
  
        const savedEvent = await response.json();
        setEvents([...events, savedEvent]); // Add saved event to state
        setNewEvent({ title: "", time: "", location: "", description: "" });
        setIsFormOpen(false);
      } catch (error) {
        console.error("Error saving event:", error);
        alert("Failed to save event. Please try again.");
      }
    } else {
      alert("Title and time are required!");
    }
  };
  

  // Exit the form with or without saving
  const handleExit = (shouldSave: boolean) => {
    if (shouldSave) {
      handleSave();
    } else {
      setNewEvent({ title: "", time: "", location: "", description: "" });
      setIsFormOpen(false);
    }
    setShowExitPrompt(false);
  };

  const handleDelete = async (eventId: string) => {
    if (!token) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/events/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      setEvents(events.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event. Please try again.");
    }
  };

 
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>Events</h1>
      <button
        onClick={() => setIsFormOpen(true)}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#3992ff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Arrange Event
      </button>

      {/* Modal Form */}
      {isFormOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              padding: "20px",
              width: "400px",
              position: "relative",
            }}
          >
            {/* Exit Button */}
            <button
              onClick={() => setShowExitPrompt(true)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ×
            </button>

            {/* Exit Prompt */}
            {showExitPrompt && (
              <div
                style={{
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "10px",
                  padding: "20px",
                  zIndex: 1000,
                }}
              >
                <p>Do you want to exit without saving?</p>
                <button
                  onClick={() => handleExit(false)}
                  style={{
                    margin: "10px",
                    padding: "5px 10px",
                    backgroundColor: "gray",
                    color: "white",
                    border: "none",
                  }}
                >
                  Exit
                </button>
                <button
                  onClick={() => handleExit(true)}
                  style={{
                    margin: "10px",
                    padding: "5px 10px",
                    backgroundColor: "#3992ff",
                    color: "white",
                    border: "none",
                  }}
                >
                  Save
                </button>
              </div>
            )}

            <h2>Arrange Event</h2>
            <label>
              Event Title:
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={handleInputChange}
                style={{ display: "block", width: "100%", marginBottom: "10px", padding: "5px" }}
              />
            </label>
            <label>
              Time:
              <input
                type="datetime-local"
                name="time"
                value={newEvent.time}
                onChange={handleInputChange}
                style={{ display: "block", width: "100%", marginBottom: "10px", padding: "5px" }}
              />
            </label>
            <label>
              Event Location (optional):
              <input
                type="text"
                name="location"
                value={newEvent.location}
                onChange={handleInputChange}
                style={{ display: "block", width: "100%", marginBottom: "10px", padding: "5px" }}
              />
            </label>
            <label>
              Description (optional):
              <textarea
                name="description"
                value={newEvent.description}
                onChange={handleInputChange}
                style={{ display: "block", width: "100%", marginBottom: "10px", padding: "5px" }}
              />
            </label>
            <button
              onClick={handleSave}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#3992ff",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                float: "right",
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Event List */}
      {/* Event List */}
<div style={{ marginTop: "20px", textAlign: "left" }}>
  {events.length > 0 ? (
    events.map((event) => (
      <div
        key={event.id}
        style={{
          padding: "10px",
          margin: "10px 0",
          border: "1px solid #ccc",
          borderRadius: "5px",
          backgroundColor: "#f9f9f9",
          position: "relative", // Enable positioning for the delete button
        }}
        onClick={() =>
          alert(
            `Title: ${event.title}\nTime: ${new Date(event.time).toLocaleString()}\nLocation: ${
              event.location || "N/A"
            }\nDescription: ${event.description || "N/A"}`
          )
        }
      >
        <strong>{event.title}</strong>
        <br />
        {new Date(event.time).toLocaleString()}

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            if (window.confirm("Are you sure you want to delete this event?")) {
              handleDelete(event.id!); 
            }
          }}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            fontSize: "16px",
            lineHeight: "24px",
            textAlign: "center",
            cursor: "pointer",
            display: "center"
          }}
          className="delete-button"
        >
          ×
        </button>
      </div>
    ))
  ) : (
    <p>No events scheduled yet.</p>
  )}
    </div>

    </div>
  );
};

export default Events;
