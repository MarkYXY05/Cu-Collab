import React, { useState, useEffect } from "react";
import GoalForm from "../components/GoalForm";
import GoalList from "../components/GoalList";

const Goal: React.FC = () => {
  const [goals, setGoals] = useState<
    { id: string; goal: string; completed: boolean; todos: { text: string; completed: boolean; id: string }[] }[]
  >([]);

  // Track selected option
  const [selectedGoalId, setSelectedGoalId] = useState<string>("new");

  // Fetch goals and todos from the backend
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch("http://localhost:8080/goals");
        const data = await response.json();
        setGoals(data);
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchGoals();
  }, []);

   // Toggle completion of a goal
   const handleToggleGoalCompletion = async (id: string, completed: boolean) => {
    try {
      await fetch(`http://localhost:8080/goals/${id}/completion`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
  
      // Fetch updated data
      const response = await fetch("http://localhost:8080/goals");
      const updatedGoals = await response.json();
      setGoals(updatedGoals); // Update local state
    } catch (error) {
      console.error("Error toggling goal completion:", error);
    }
  };
  

    // Toggle completion of a to-do
    const handleToggleToDoCompletion = async (goalId: string, todoId: string, completed: boolean) => {
      try {
        await fetch(`http://localhost:8080/goals/${goalId}/todos/${todoId}/completion`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed }),
        });
    
        // Fetch updated data
        const response = await fetch("http://localhost:8080/goals");
        const updatedGoals = await response.json();
        setGoals(updatedGoals); // Update local state
      } catch (error) {
        console.error("Error toggling todo completion:", error);
      }
    };

  // Add a new goal
  const handleAddGoal = async (goal: string) => {
    try {
      const response = await fetch("http://localhost:8080/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, todos: [] }),
      });
      const newGoal = await response.json();
      setGoals([...goals, newGoal]);
      setSelectedGoalId("new"); // Reset to "Enter a new goal"
    } catch (error) {
      console.error("Error adding goal:", error);
    }
  };

  // Edit a goal
  const handleEditGoal = async (id: string, updatedGoal: string) => {
    try {
      await fetch(`http://localhost:8080/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: updatedGoal }),
      });
      setGoals(goals.map((goal) => (goal.id === id ? { ...goal, goal: updatedGoal } : goal)));
    } catch (error) {
      console.error("Error editing goal:", error);
    }
  };

  // Delete a goal
  const handleDeleteGoal = async (id: string) => {
    try {
      await fetch(`http://localhost:8080/goals/${id}`, { method: "DELETE" });
      setGoals(goals.filter((goal) => goal.id !== id));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  // Add a to-do to a goal
  const handleAddToDo = async (goalId: string, todoText: string) => {
    try {
      const response = await fetch(`http://localhost:8080/goals/${goalId}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: todoText, completed: false }),
      });
      const newToDo = await response.json();
      setGoals(
        goals.map((goal) =>
          goal.id === goalId ? { ...goal, todos: [...goal.todos, newToDo] } : goal
        )
      );
    } catch (error) {
      console.error("Error adding to-do:", error);
    }
  };

  // Edit a to-do
  const handleEditToDo = async (goalId: string, todoId: string, updatedToDo: string) => {
    try {
      await fetch(`http://localhost:8080/goals/${goalId}/todos/${todoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: updatedToDo }),
      });
      setGoals(
        goals.map((goal) =>
          goal.id === goalId
            ? {
                ...goal,
                todos: goal.todos.map((todo) =>
                  todo.id === todoId ? { ...todo, text: updatedToDo } : todo
                ),
              }
            : goal
        )
      );
    } catch (error) {
      console.error("Error editing to-do:", error);
    }
  };

  // Delete a to-do
  const handleDeleteToDo = async (goalId: string, todoId: string) => {
    try {
      await fetch(`http://localhost:8080/goals/${goalId}/todos/${todoId}`, { method: "DELETE" });
      setGoals(
        goals.map((goal) =>
          goal.id === goalId
            ? { ...goal, todos: goal.todos.filter((todo) => todo.id !== todoId) }
            : goal
        )
      );
    } catch (error) {
      console.error("Error deleting to-do:", error);
    }
  };

  return (
    <div>
      <h1>Goals</h1>

      {/* Scroll Menu */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
        <select
          value={selectedGoalId}
          onChange={(e) => setSelectedGoalId(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "1rem",
            borderRadius: "8px",
            marginRight: "10px",
          }}
        >
          <option value="new">Enter a new goal</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.goal}
            </option>
          ))}
        </select>

        {/* Form to Add Goal or To-Do */}
        {selectedGoalId === "new" ? (
          <GoalForm onAddGoal={handleAddGoal} placeholder="Enter your goal here" />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const todoInput = (e.target as HTMLFormElement).todo.value.trim();
              if (todoInput) {
                handleAddToDo(selectedGoalId, todoInput);
                (e.target as HTMLFormElement).reset();
              }
            }}
            style={{ display: "flex", gap: "10px" }}
          >
            <input
              type="text"
              name="todo"
              placeholder="Enter a to-do for the selected goal"
              required
              style={{
                flexGrow: 1,
                padding: "10px",
                fontSize: "1rem",
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
                cursor: "pointer",
              }}
            >
              Add To-Do
            </button>
          </form>
        )}
      </div>

      {/* Goal List */}
      <GoalList
        goals={goals}
        onDeleteGoal={handleDeleteGoal}
        onEditGoal={handleEditGoal}
        onAddToDo={handleAddToDo}
        onDeleteToDo={handleDeleteToDo}
        onEditToDo={handleEditToDo}
        onToggleGoalCompletion={handleToggleGoalCompletion}
        onToggleToDoCompletion={handleToggleToDoCompletion}
      />
    </div>
  );
};

export default Goal;
