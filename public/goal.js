let goals = []; // Array to store goals
let toDos = {}; // Object to store to-dos for each goal

// Navigation Function to switch between pages
function navigateTo(page) {
  window.location.href = `${page}.html`;
}

// Fetch and display goals
function loadGoals() {
  const goalsContainer = document.getElementById('goals-container');
  const goalSelector = document.getElementById('goal-selector');

  goalsContainer.innerHTML = '';
  goalSelector.innerHTML = '<option value="new">Enter a new goal</option>';

  goals.forEach((goal, index) => {
    // Add goals to the dropdown selector
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `Goal ${index + 1}`;
    goalSelector.appendChild(option);

    // Display goals with index
    const goalContainer = document.createElement('div');
    goalContainer.className = 'goal-container';
    goalContainer.dataset.index = index;

    const goalIndex = document.createElement('span');
    goalIndex.className = 'goal-index';
    goalIndex.textContent = `${index + 1}.`;

    const goalText = document.createElement('span');
    goalText.className = 'goal-text';
    goalText.textContent = goal;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'x';
    deleteButton.className = 'delete-button';
    deleteButton.style.display = 'none';

    // Show delete button on hover
    goalContainer.addEventListener('mouseover', () => {
      deleteButton.style.display = 'inline-block';
    });
    goalContainer.addEventListener('mouseout', () => {
      deleteButton.style.display = 'none';
    });

    // Delete goal on click
    deleteButton.addEventListener('click', () => {
      goals.splice(index, 1);
      delete toDos[index];
      loadGoals();
    });

    goalContainer.appendChild(goalIndex);
    goalContainer.appendChild(goalText);
    goalContainer.appendChild(deleteButton);

    // Add To-Dos for the goal
    const todosForGoal = toDos[index] || [];
    todosForGoal.forEach((todo) => {
      const todoContainer = document.createElement('div');
      todoContainer.className = 'todo-container';
      todoContainer.textContent = `To-do: ${todo}`;
      goalContainer.appendChild(todoContainer);
    });

    goalsContainer.appendChild(goalContainer);
  });
}

// Handle adding a new goal or to-do
function setupGoalForm() {
  const form = document.getElementById('goal-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const goalInput = document.getElementById('goal-input');
    const goalContent = goalInput.value.trim();
    const goalSelector = document.getElementById('goal-selector');
    const selectedValue = goalSelector.value;

    if (goalContent) {
      if (selectedValue === 'new') {
        // Add a new goal
        goals.push(goalContent);
      } else {
        // Add a to-do under the selected goal
        const selectedIndex = parseInt(selectedValue, 10);
        if (!toDos[selectedIndex]) {
          toDos[selectedIndex] = [];
        }
        toDos[selectedIndex].push(goalContent);
      }

      // Reload goals and retain selected dropdown value
      const currentSelection = goalSelector.value;
      loadGoals();
      goalSelector.value = currentSelection;

      // Clear input
      goalInput.value = '';
    }
  });
}

// Handle selecting a goal or "Enter a new goal"
function handleGoalSelection() {
  const goalSelector = document.getElementById('goal-selector');
  const selectedValue = goalSelector.value;

  const goalInput = document.getElementById('goal-input');
  if (selectedValue === 'new') {
    // When "Enter a new goal" is selected
    goalInput.placeholder = 'Enter your goal here';
  } else {
    // When an existing goal is selected
    const selectedIndex = parseInt(selectedValue, 10);
    goalInput.placeholder = `To-do for Goal ${selectedIndex + 1}`;
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  loadGoals();
  setupGoalForm();
});
