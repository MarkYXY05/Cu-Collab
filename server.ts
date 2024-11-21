import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// In-memory storage for messages
interface Message {
  id: string;
  content: string;
}

let messages: Message[] = [];

// GET endpoint to fetch all messages
app.get('/messages', (req: Request, res: Response) => {
  res.json({ messages });
});

// POST endpoint to add a new message
app.post('/messages', (req: Request, res: Response) => {
  const { content } = req.body;

  if (content) {
    const id = Math.random().toString(36).substr(2, 9); // Generate a unique ID
    const newMessage: Message = { id, content };
    messages.push(newMessage);
    res.status(201).json(newMessage); // Respond with the newly added message
  } else {
    res.status(400).json({ error: 'Content is required' });
  }
});

// DELETE endpoint to delete a message by ID
app.delete('/messages/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  messages = messages.filter((message) => message.id !== id);
  res.status(200).json({ success: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



// server.ts
app.get('/progress', (req, res) => {
  const progressData = {
    progress: 50,
    tasks: [
      { task: "Complete project documentation", contributor: "Alice", progress: "Done" },
      { task: "Implement user authentication", contributor: "Bob", progress: "In Progress" },
      { task: "Set up project deployment", contributor: "Charlie", progress: "Not Started" }
    ]
  };
  res.json(progressData);
});


