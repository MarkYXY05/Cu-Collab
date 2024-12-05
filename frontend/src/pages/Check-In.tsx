import React, { useState, useEffect } from "react";
import { useAuth } from "../components/auth/AuthUserProvider";

const CheckIn: React.FC = () => {
  const { user } = useAuth();
  const [checkInCount, setCheckInCount] = useState<number | null>(null);
  const [lastCheckIn, setLastCheckIn] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const fetchCheckInData = async () => {
    if (!user) return;
    const token = await user.getIdToken();
    try {
      const response = await fetch(`http://localhost:8080/check-in/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCheckInCount(data.checkInCount || 0);
      setLastCheckIn(data.lastCheckIn);
      setIsButtonDisabled(data.lastCheckIn === new Date().toISOString().split("T")[0]);
    } catch (error) {
      console.error("Error fetching check-in data:", error);
    }
  };

  const handleCheckIn = async () => {
    if (!user || isButtonDisabled) return;
    const token = await user.getIdToken();
    try {
      const response = await fetch(`http://localhost:8080/check-in/${user.uid}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setCheckInCount(data.checkInCount || 0);
      setLastCheckIn(data.lastCheckIn);
      setIsButtonDisabled(true);
    } catch (error) {
      console.error("Error during check-in:", error);
    }
  };

  useEffect(() => {
    fetchCheckInData();
  }, [user]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <button
        onClick={handleCheckIn}
        disabled={isButtonDisabled}
        style={{
          backgroundColor: isButtonDisabled ? "gray" : "#4caf50",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: isButtonDisabled ? "not-allowed" : "pointer",
        }}
      >
        {isButtonDisabled ? "Checked In" : "Check In"}
      </button>
      <p style={{ marginTop: "20px", fontSize: "18px" }}>
        You have been working for <strong>{checkInCount}</strong> days! Great work!
      </p>
    </div>
  );
};

export default CheckIn;
