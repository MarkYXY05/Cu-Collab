import React from 'react';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '8px', margin: '20px 0' }}>
      <div
        style={{
          width: `${progress}%`,
          backgroundColor: '#4caf50',
          height: '30px',
          borderRadius: '8px',
          textAlign: 'center',
          lineHeight: '30px',
          color: 'white',
        }}
      >
        {progress}%
      </div>
    </div>
  );
};

export default ProgressBar;
