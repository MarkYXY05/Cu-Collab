import React, { useState } from "react";

interface GoalListProps {
  goals: {
    id: string;
    goal: string;
    completed: boolean;
    todos: { text: string; completed: boolean; id: string }[];
  }[];
  onDeleteGoal: (id: string) => void;
  onEditGoal: (id: string, updatedGoal: string) => void;
  onAddToDo: (goalId: string, todoText: string) => void;
  onDeleteToDo: (goalId: string, todoId: string) => void;
  onEditToDo: (goalId: string, todoId: string, updatedToDo: string) => void;
  onToggleGoalCompletion: (id: string, completed: boolean) => void;
  onToggleToDoCompletion: (goalId: string, todoId: string, completed: boolean) => void;
}

const GoalList: React.FC<GoalListProps> = ({
  goals,
  onDeleteGoal,
  onEditGoal,
  onDeleteToDo,
  onEditToDo,
  onToggleGoalCompletion,
  onToggleToDoCompletion,
}) => {
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingToDo, setEditingToDo] = useState<{ goalId: string; todoId: string } | null>(null);
  const [editInput, setEditInput] = useState<string>("");

  return (
    <div>
      {goals.map((goal) => (
        <div
          key={goal.id}
          style={{
            marginBottom: "20px",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            backgroundColor: goal.completed ? "#e0f7e9" : "#f9f9f9", // Background color for completed goals
          }}
        >
          {/* Goal Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={(e) => onToggleGoalCompletion(goal.id, e.target.checked)}
                style={{ cursor: "pointer" }}
              />
              {editingGoalId === goal.id ? (
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
                <h3 style={{ textDecoration: goal.completed ? "line-through" : "none" }}>
                  {goal.goal}
                </h3>
              )}
            </div>

            <div>
              {editingGoalId === goal.id ? (
                <button
                  onClick={() => {
                    onEditGoal(goal.id, editInput);
                    setEditingGoalId(null);
                  }}
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
                  onClick={() => {
                    setEditingGoalId(goal.id);
                    setEditInput(goal.goal);
                  }}
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
                onClick={() => onDeleteGoal(goal.id)}
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

          {/* To-Dos */}
          <ul>
            {goal.todos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "10px",
                  backgroundColor: todo.completed ? "#e0f7e9" : "#ffffff", // Background color for completed to-dos
                  padding: "5px 10px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={(e) =>
                      onToggleToDoCompletion(goal.id, todo.id, e.target.checked)
                    }
                    style={{ cursor: "pointer" }}
                  />
                  {editingToDo?.goalId === goal.id && editingToDo?.todoId === todo.id ? (
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
                    <span
                      style={{
                        textDecoration: todo.completed ? "line-through" : "none",
                      }}
                    >
                      {todo.text}
                    </span>
                  )}
                </div>
                <div>
                  {editingToDo?.goalId === goal.id && editingToDo?.todoId === todo.id ? (
                    <button
                      onClick={() => {
                        onEditToDo(goal.id, todo.id, editInput);
                        setEditingToDo(null);
                      }}
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
                      onClick={() => {
                        setEditingToDo({ goalId: goal.id, todoId: todo.id });
                        setEditInput(todo.text);
                      }}
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
                    onClick={() => onDeleteToDo(goal.id, todo.id)}
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
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default GoalList;
