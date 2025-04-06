import React from 'react';
import './FeatureCards.css';

function FeatureCards() {
  const features = [
    {
      icon: '▶️',
      title: 'Watch Videos',
      text: 'Paste any YouTube link and instantly start learning.',
    },
    {
      icon: '📄',
      title: 'Get Summaries',
      text: 'Summarized content that’s quick to grasp.',
    },
    {
      icon: '💬',
      title: 'Ask Questions',
      text: 'Interact with our AI to clarify concepts.',
    },
  ];

  return (
    <div className="d-flex flex-column flex-lg-row justify-content-around mt-5 gap-3">
      {features.map((f, idx) => (
        <div key={idx} className="card text-dark bg-light p-3 rounded shadow-sm flex-fill text-center">
          <div className="fs-1 mb-2">{f.icon}</div>
          <h5>{f.title}</h5>
          <p className="mb-0">{f.text}</p>
        </div>
      ))}
    </div>
  );
}

export default FeatureCards;
