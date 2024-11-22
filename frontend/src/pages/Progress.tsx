import React, { useState, useEffect } from "react";
import { useAuth } from "../components/auth/AuthUserProvider"; // **Added import for authentication**

const Progress: React.FC = () => {
  const [completedGoals, setCompletedGoals] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [completedToDos, setCompletedToDos] = useState(0);
  const [totalToDos, setTotalToDos] = useState(0);
  const { user } = useAuth(); // **Access user information from authentication context**
  const [token, setToken] = useState<string | null>(null);

  // Fetch the user's token
  useEffect(() => {
    if (user) {
      user.getIdToken().then((token) => setToken(token)); // **Get ID token from user**
    } else {
      setToken(null);
    }
  }, [user]); // **Re-fetch token when user changes**

  useEffect(() => {
    const fetchProgressData = async () => {
      if (!token) return; // **Return early if no token is available**

      try {
        const response = await fetch("http://localhost:8080/goals", {
          headers: {
            Authorization: `Bearer ${token}`, // **Added token to request headers**
          },
        });
        const data = await response.json();

        const totalGoalsCount = data.length;
        const completedGoalsCount = data.filter((goal: any) => goal.completed).length;

        let totalToDosCount = 0;
        let completedToDosCount = 0;

        data.forEach((goal: any) => {
          totalToDosCount += goal.todos.length;
          completedToDosCount += goal.todos.filter((todo: any) => todo.completed).length;
        });

        setTotalGoals(totalGoalsCount);
        setCompletedGoals(completedGoalsCount);
        setTotalToDos(totalToDosCount);
        setCompletedToDos(completedToDosCount);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    };

    fetchProgressData();
  }, [token]); // **Fetch progress data whenever token updates**

  const calculateProgress = (completed: number, total: number): number =>
    total > 0 ? (completed / total) * 100 : 0;

  const goalProgress = calculateProgress(completedGoals, totalGoals);
  const toDoProgress = calculateProgress(completedToDos, totalToDos);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Progress</h1>

      {/* Progress Bar */}
      <div
        style={{
          width: "100%",
          height: "30px",
          backgroundColor: "#f3f3f3",
          borderRadius: "8px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: `${toDoProgress}%`,
            height: "100%",
            backgroundColor: "#4caf50",
            transition: "width 0.3s ease-in-out",
          }}
        ></div>
      </div>

      {/* Progress Information */}
      <p style={{ fontSize: "18px", marginBottom: "10px" }}>
        <strong>Goals completed:</strong> {completedGoals}/{totalGoals}
      </p>
      <p style={{ fontSize: "18px", marginBottom: "20px" }}>
        <strong>To-do's completed:</strong> {completedToDos}/{totalToDos}
      </p>

      {/* Encouraging Statement */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#e8f5e9",
          borderRadius: "8px",
          textAlign: "center",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        Keep up the great work! You're making amazing progress!
      </div>
    </div>
  );
};

export default Progress;
