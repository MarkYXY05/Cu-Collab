import React from 'react';

interface GoalSelectorProps {
  goals: string[];
  selectedGoal: string;
  onSelectGoal: (value: string) => void;
}

const GoalSelector: React.FC<GoalSelectorProps> = ({ goals, selectedGoal, onSelectGoal }) => {
  return (
    <select
      value={selectedGoal}
      onChange={(e) => onSelectGoal(e.target.value)}
      style={{ padding: '10px', borderRadius: '8px', width: '200px' }}
    >
      <option value="new">Enter a new goal</option>
      {goals.map((goal, index) => (
        <option key={index} value={index.toString()}>
          Goal {index + 1}
        </option>
      ))}
    </select>
  );
};

export default GoalSelector;
