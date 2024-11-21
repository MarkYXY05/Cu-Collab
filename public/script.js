
// public/script.js

// Fetch and display messages from the server
async function loadMessages() {
  const response = await fetch('/messages'); // GET request to fetch messages
  const data = await response.json();

  const messagesContainer = document.getElementById('messages-container');
  messagesContainer.innerHTML = ''; // Clear existing messages

  // Add each message to the message board
  data.messages.forEach((message) => {
    const messageElement = document.createElement('div');
    messageElement.className = 'message-container'; // Add container for text and delete button
    messageElement.dataset.id = message.id; // Store message ID

    // Text part of the message
    const textElement = document.createElement('span');
    textElement.className = 'message-text';
    textElement.textContent = message.content;

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'x';
    deleteButton.className = 'delete-button';
    deleteButton.style.display = 'none';

    // Show delete button on hover
    messageElement.addEventListener('mouseover', () => {
      deleteButton.style.display = 'inline-block';
    });
    messageElement.addEventListener('mouseout', () => {
      deleteButton.style.display = 'none';
    });

    // Delete message on click
    deleteButton.addEventListener('click', async () => {
      const messageId = messageElement.dataset.id;
      await fetch(`/messages/${messageId}`, { method: 'DELETE' });
      loadMessages(); // Reload messages after deletion
    });

    messageElement.appendChild(textElement); // Add the message text
    messageElement.appendChild(deleteButton); // Add the delete button
    messagesContainer.appendChild(messageElement); // Add the container to the list
  });
}

// Submit a new message with "Enter" key or button click
function setupMessageForm() {
  const form = document.getElementById('message-form');
  const messageInput = document.getElementById('message-input');

  const postMessage = async () => {
    const messageContent = messageInput.value.trim();

    if (messageContent) {
      // Send the message to the server via POST request
      const response = await fetch('/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: messageContent }),
      });

      const result = await response.json();

      if (response.ok) {
        // Reload messages and clear input field
        loadMessages();
        messageInput.value = '';
      }
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form from refreshing the page
    await postMessage();
  });

  // Listen for "Enter" keypress
  messageInput.addEventListener('keypress', async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      await postMessage();
    }
  });
}

// Navigation Function to switch between pages
function navigateTo(page) {
  window.location.href = `${page}.html`;
}

// Initialize the page functionality based on the current page
document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split('/').pop();

  if (page === 'index.html' || page === '') {
    loadMessages();
    setupMessageForm();
  } else if (page === "goal.html") {
    loadGoals();
    setupGoalForm();
  }
});

