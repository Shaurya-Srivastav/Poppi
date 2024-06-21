// src/Pages/dashboard/ChatPage.js

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import './ChatPage.css';
import ChatHistoryItem from '../../components/ChatHistoryItem';
import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const ChatPage = ({ workbook, onClose }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, [workbook.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    const chatsQuery = query(
      collection(db, "chats"),
      where("workbookId", "==", workbook.id),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(chatsQuery);
    const chatsData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setChatHistory(chatsData);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewChat = async () => {
    const newChat = {
      workbookId: workbook.id,
      createdAt: new Date().toISOString(),
      messages: []
    };
    const docRef = await addDoc(collection(db, "chats"), newChat);
    const chatWithId = { ...newChat, id: docRef.id };
    setChatHistory([chatWithId, ...chatHistory]);
    setCurrentChat(chatWithId);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      if (!currentChat) {
        await createNewChat();
      }

      const userMessage = { role: 'user', content: newMessage };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setNewMessage("");
      setIsLoading(true);

      try {
        const response = await axios.post('http://localhost:5000/chat', {
          messages: updatedMessages
        });

        const assistantMessage = { role: 'assistant', content: response.data.response };
        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);

        // Update chat in Firestore
        await updateDoc(doc(db, "chats", currentChat.id), {
          messages: finalMessages
        });

        // Update local chat history
        const updatedHistory = chatHistory.map(chat => 
          chat.id === currentChat.id ? { ...chat, messages: finalMessages } : chat
        );
        setChatHistory(updatedHistory);
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = { role: 'assistant', content: 'Sorry, there was an error processing your request.' };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const loadChat = (chat) => {
    setCurrentChat(chat);
    setMessages(chat.messages);
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h3>{workbook.name}</h3>
        <FaTimes className="close-icon" onClick={onClose} />
      </div>
      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="sidebar-content">
            <h4>Chat History</h4>
            <div className="chat-history">
              {chatHistory.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  date={new Date(chat.createdAt).toLocaleString()}
                  onClick={() => loadChat(chat)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="chat-main">
          <div className="messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                {message.content}
              </div>
            ))}
            {isLoading && <div className="message assistant">Thinking...</div>}
            <div ref={messagesEndRef} />
          </div>
          <div className="message-input">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage} disabled={isLoading}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;