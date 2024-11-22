import express, { Request, Response, NextFunction } from "express";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
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

// ==================== AUTHENTICATION MIDDLEWARE ====================

const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    (req as any).user = decodedToken; // Attach user information to request object
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

// ==================== MESSAGE ENDPOINTS ====================

// GET: Retrieve all messages (Protected)
app.get("/messages", authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.uid; // Retrieve user ID from the decoded token
  console.log(userId)
  try {
    const messagesRef = db.collection("messages");
    const snapshot = await messagesRef
      .where("userId", "==", userId)
      .orderBy("timestamp", "asc")
      .get();
    console.log(snapshot.size)
    console.log(snapshot.docs)
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log(messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});

// POST: Add a new message (Protected)
app.post("/messages", authenticate, async (req, res) => {
  const { message } = req.body;
  const user = (req as any).user; // Access authenticated user

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  try {
    const messagesRef = db.collection("messages");
    const newMessage = await messagesRef.add({
      message,
      userId: user.uid,
      timestamp: new Date(),
    });
    res.status(201).json({ id: newMessage.id, message });
  } catch (error) {
    console.error("Error saving message:", error);
    res.status(500).json({ error: "Failed to save message" });
  }
});


// PUT: Update a message
app.put("/messages/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: "Message content is required" });
    return;
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
app.delete("/messages/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
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

// GET: Retrieve all goals and todos (Protected)
app.get("/goals", authenticate, async (req: Request, res: Response) => {
  const userId = (req as any).user.uid;
  try {
    const goalsRef = db.collection("goals");
    const snapshot = await goalsRef
      .where("userId", "==", userId) // Filter goals by user ID
      .orderBy("timestamp", "asc")
      .get();

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


// POST: Add a new goal (Protected)
app.post("/goals", authenticate, async (req: Request, res: Response) => {
  const { goal, todos = [] } = req.body;
  const userId = (req as any).user.uid;

  if (!goal) {
    res.status(400).json({ error: "Goal is required" });
    return;
  }

  try {
    const goalsRef = db.collection("goals");
    const newGoal = await goalsRef.add({
      goal,
      todos,
      userId: userId, // Associate goal with user ID
      timestamp: new Date(),
    });
    res.status(201).json({ id: newGoal.id, goal, todos });
  } catch (error) {
    console.error("Error saving goal:", error);
    res.status(500).json({ error: "Failed to save goal" });
  }
});

// PUT: Update a goal (Protected)
app.put("/goals/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { goal } = req.body;
  const userId = (req as any).user.uid; // Retrieve authenticated user's ID

  if (!goal) {
    res.status(400).json({ error: "Goal content is required" });
    return;
  }

  try {
    const goalRef = db.collection("goals").doc(id);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const goalData = goalDoc.data();
    if (!goalData) {
      res.status(500).json({ error: "Goal data is undefined" });
      return;
    }

    // Verify that the goal belongs to the authenticated user
    if (goalData.userId !== userId) {
      res.status(403).json({ error: "Permission denied" });
      return;
    }

    // Update the goal
    await goalRef.update({ goal });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ error: "Failed to update goal" });
  }
});


// PUT: Update Goal Completion
app.put("/goals/:id/completion", authenticate, async (req: Request, res: Response) => {
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

// DELETE: Delete a goal (Protected)
app.delete("/goals/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = (req as any).user.uid; // Retrieve authenticated user's ID

  try {
    const goalRef = db.collection("goals").doc(id);
    const goalDoc = await goalRef.get();

    // Check if the goal exists
    if (!goalDoc.exists) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const goalData = goalDoc.data();

    // Validate goal ownership
    if (!goalData || goalData.userId !== userId) {
      res.status(403).json({ error: "Permission denied" });
      return;
    }

    // Delete the goal
    await goalRef.delete();
    res.status(200).json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ error: "Failed to delete goal" });
  }
});



// POST: Add a to-do to a goal (Protected)
app.post("/goals/:goalId/todos", authenticate, async (req: Request, res: Response): Promise<void> => {
  const { goalId } = req.params;
  const { text, completed = false } = req.body;
  const userId = (req as any).user.uid; // Retrieve authenticated user's ID

  if (!text) {
    res.status(400).json({ error: "To-do text is required" });
    return;
  }

  try {
    const goalRef = db.collection("goals").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const goalData = goalDoc.data();
    if (!goalData) {
      res.status(500).json({ error: "Goal data is undefined" });
      return;
    }

    // Verify that the goal belongs to the authenticated user
    if (goalData?.userId !== userId) {
      res.status(403).json({ error: "Permission denied" });
      return;
    }
    
    const todos = goalData.todos || [];
    const newTodo = { text, completed, id: `${Date.now()}` }; // Add a unique ID to the new to-do
    todos.push(newTodo);

    await goalRef.update({ todos });
    res.status(201).json(newTodo);
  } catch (error) {
    console.error("Error adding to-do:", error);
    res.status(500).json({ error: "Failed to add to-do" });
  }
});


// PUT: Update a to-do (Protected)
app.put("/goals/:goalId/todos/:todoId", authenticate, async (req: Request, res: Response): Promise<void> => {
  const { goalId, todoId } = req.params;
  const { text } = req.body;
  const userId = (req as any).user.uid; // Retrieve authenticated user's ID

  if (!text) {
    res.status(400).json({ error: "To-do text is required" });
    return;
  }

  try {
    const goalRef = db.collection("goals").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const goalData = goalDoc.data();
    if (!goalData) {
      res.status(500).json({ error: "Goal data is undefined" });
      return;
    }

    // Verify that the goal belongs to the authenticated user
    if (goalData.userId !== userId) {
      res.status(403).json({ error: "Permission denied" });
      return;
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
app.delete("/goals/:goalId/todos/:todoId", authenticate, async (req: Request, res: Response): Promise<void> => {
  const { goalId, todoId } = req.params;
  const userId = (req as any).user.uid; // Retrieve authenticated user's ID

  try {
    const goalRef = db.collection("goals").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const goalData = goalDoc.data();
    if (!goalData) {
      res.status(500).json({ error: "Goal data is undefined" });
      return;
    }

    // Verify that the goal belongs to the authenticated user
    if (goalData.userId !== userId) {
      res.status(403).json({ error: "Permission denied" });
      return;
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
app.put("/goals/:goalId/todos/:todoId/completion", authenticate, async (req: Request, res: Response): Promise<void> => {
  const { goalId, todoId } = req.params;
  const { completed } = req.body;
  const userId = (req as any).user.uid; // Retrieve authenticated user's ID

  if (typeof completed !== "boolean") {
    res.status(400).json({ error: "Completion status must be a boolean" });
    return;
  }

  try {
    const goalRef = db.collection("goals").doc(goalId);
    const goalDoc = await goalRef.get();

    if (!goalDoc.exists) {
      res.status(404).json({ error: "Goal not found" });
      return;
    }

    const goalData = goalDoc.data();
    if (!goalData) {
      res.status(500).json({ error: "Goal data is undefined" });
      return;
    }

    // Verify that the goal belongs to the authenticated user
    if (goalData.userId !== userId) {
      res.status(403).json({ error: "Permission denied" });
      return;
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
