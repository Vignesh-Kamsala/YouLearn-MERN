import React from 'react';
import './ChatButton.css';

function ChatButton() {
  const handleClick = () => {
    alert("Chatbot coming soon!");
  };

  return (
    <button className="chat-btn" onClick={handleClick}>
      <i className="bi bi-chat-dots-fill"></i>
    </button>
  );
}

export default ChatButton;
