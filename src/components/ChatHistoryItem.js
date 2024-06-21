// src/components/ChatHistoryItem.js

import React from 'react';

const ChatHistoryItem = ({ date, name, onClick }) => {
  return (
    <div className="chat-history-item" onClick={onClick}>
      <div className="chat-history-name">{name}</div>
      <div className="chat-history-date">{date}</div>
    </div>
  );
};

export default ChatHistoryItem;