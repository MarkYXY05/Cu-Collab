import express, { Request, Response } from "express";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith("http://localhost")) {
        // Allow requests from localhost (or no origin for server-to-server requests)
        callback(null, true);
      } else {
        // Reject other origins
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);


// Initialize Firebase Admin
const serviceAccount = require("./config/firebase-service-account.json");

initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();

// ==================== MESSAGE ENDPOINTS ====================

// GET: Retrieve all messages
app.get("/messages", async (req: Request, res: Response) => {
  try {
    const messagesRef = db.collection("messages");
    const snapshot = await messagesRef.orderBy("timestamp", "asc").get();

    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});

// POST: Add a new message
app.post("/messages", async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    const messagesRef = db.collection("messages");
    const newMessage = await messagesRef.add({ message, timestamp: new Date() });
    res.status(201).json({ id: newMessage.id, message });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
});

// PUT: Update a message
app.put("/messages/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message content is required" });
  }

  try {
    const messageRef = db.collection("messages").doc(id);
    await messageRef.update({ message });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).json({ error: "Failed to update message" });
  }
});

// DELETE: Delete a message
app.delete("/messages/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const messageRef = db.collection("messages").doc(id);
    await messageRef.delete();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// ==================== GOAL AND TODO ENDPOINTS ====================

// GET: Retrieve all goals and todos
app.get("/goals", async (req: Request, res: Response) => {
  try {
    const goalsRef = db.collection("goals");
    const snapshot = await goalsRef.orderBy("timestamp", "asc").get();

    const goals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(goals);
  } catch (error) {
    console.error("Error retrieving goals:", error);
    res.status(500).json({ error: "Failed to retrieve goals" });
  }
});

// POST: Add a new goal
app.post("/goals", async (req: Request, res: Response) => {
  const { goal, todos = [] } = req.body;
  if (!goal) {
    return res.status(400).json({ error: "Goal is required" });
  }

  try {
    const goalsRef = db.collection("goals");
    const newGoal = await goalsRef.add({ goal, todos, timestamp: new Date() });
    res.status(201).json({ id: newGoal.id, goal, todos });
  } catch (error) {
    console.error("Error saving goal:", error);
    res.status(500).json({ error: "Failed to save goal" });
  }
});

// PUT: Update a goal
app.put("/goals/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { goal } = req.body;

  if (!goal) {
    return res.status(400).json({ error: "Goal content is required" });
  }

  try {
    const goalRef = db.collection("goals").doc(id);
    await goalRef.update({ goal });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ error: "Failed to update goal" });
  }
});

// PUT: Update Goal Completion
app.put("/goals/:id/completion", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const goalRef = db.collection("goals").doc(id);
    await goalRef.update({ completed });
    const updatedGoal = (await goalRef.get()).data();

    res.status(200).json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal completion:", error);
    res.status(500).json({ error: "Failed to update goal completion" });
  }
});

// DELETE: Delete a goal
app.delete("/goals/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const goalRef = db.collection("goals").doc(id);
    await goalRef.delete();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ error: "Failed to delete goal" });
  }
});

// POST: Add a to-do to a goal
app.post("/goals/:goalId/todos", async (req: Request, res: Response) => {
  const { goalId } = req.params;
  const { text, completed = false } = req.body;

  if (!text) {
    return res.status(400).json({ error: "To-do text is required" });
  }

  try {
    const goalRef = db.collection("goals").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const goalData = goalDoc.data();
    const todos = goalData?.todos || [];
    const newTodo = { text, completed, id: `${Date.now()}` };
    todos.push(newTodo);

    await goalRef.update({ todos });
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error adding to-do:", error);
    res.status(500).json({ error: "Failed to add to-do" });
  }
});

// PUT: Update a to-do
app.put("/goals/:goalId/todos/:todoId", async (req: Request, res: Response) => {
  const { goalId, todoId } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "To-do text is required" });
  }

  try {
    const goalRef = db.collection("goals").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const goalData = goalDoc.data();
    if (!goalData) {
        return res.status(500).json({ error: "Goal data is undefined" });
    }

    const todos = goalData.todos.map((todo: any) =>
      todo.id === todoId ? { ...todo, text } : todo
    );

    await goalRef.update({ todos });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating to-do:", error);
    res.status(500).json({ error: "Failed to update to-do" });
  }
});

// DELETE: Delete a to-do
app.delete("/goals/:goalId/todos/:todoId", async (req: Request, res: Response) => {
  const { goalId, todoId } = req.params;

  try {
    const goalRef = db.collection("goals").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const goalData = goalDoc.data();
    if (!goalData) {
        return res.status(500).json({ error: "Goal data is undefined" });
    }

    const todos = goalData.todos.filter((todo: any) => todo.id !== todoId);

    await goalRef.update({ todos });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting to-do:", error);
    res.status(500).json({ error: "Failed to delete to-do" });
  }
});


// PUT: Update To-do Completion

app.put("/goals/:goalId/todos/:todoId/completion", async (req: Request, res: Response) => {
  const { goalId, todoId } = req.params;
  const { completed } = req.body;

  try {
    const goalRef = db.collection("goals").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      return res.status(404).json({ error: "Goal not found" });
    }

    const goalData = goalDoc.data();
    if (!goalData) {
      return res.status(500).json({ error: "Goal data is undefined" });
    }
    const updatedTodos = goalData.todos.map((todo: any) =>
      todo.id === todoId ? { ...todo, completed } : todo
    );

    await goalRef.update({ todos: updatedTodos });
    res.status(200).json({ id: todoId, completed });
  } catch (error) {
    console.error("Error updating todo completion:", error);
    res.status(500).json({ error: "Failed to update todo completion" });
  }
});



// Start the server
const port = 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));
