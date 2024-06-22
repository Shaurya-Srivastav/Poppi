import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTimes, FaCode } from 'react-icons/fa';
import './ChatPage.css';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const ChatHistoryItem = ({ date, name, onClick, disabled }) => (
  <div 
    className={`chat-history-item ${disabled ? 'disabled' : ''}`} 
    onClick={disabled ? null : onClick}
    style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
    title={disabled ? "Can't switch chats while bot is responding" : ""}
  >
    <p className="chat-history-name">{name}</p>
    <small className="chat-history-date">{date}</small>
  </div>
);

const ChatPage = ({ workbook, onClose }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [isCodePopupOpen, setIsCodePopupOpen] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
  }, [workbook.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
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
    } catch (error) {
      if (error.code === 'failed-precondition') {
        console.error('Index creation required:', error.message);
        alert('Index creation required. Please follow the instructions in the Firebase console to create the required index.');
      } else {
        console.error('Error loading chat history:', error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createNewChat = async (name = "New Chat") => {
    const newChat = {
      workbookId: workbook.id,
      name: name,
      createdAt: new Date().toISOString(),
      messages: []
    };
    const docRef = await addDoc(collection(db, "chats"), newChat);
    const chatWithId = { ...newChat, id: docRef.id };
    setChatHistory(prevHistory => [chatWithId, ...prevHistory]);
    setCurrentChat(chatWithId);
    setMessages([]);
    return chatWithId;
  };

  const handleSendMessage = async (content = newMessage) => {
    if (content.trim() !== "" && !isBotResponding) {
      if (!currentChat) {
        setIsPopupOpen(true);
        return;
      }

      const userMessage = { role: 'user', content: content };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setNewMessage("");
      setIsLoading(true);
      setIsBotResponding(true);

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
        setChatHistory(prevHistory =>
          prevHistory.map(chat =>
            chat.id === currentChat.id ? { ...chat, messages: finalMessages } : chat
          )
        );
        setCurrentChat({ ...currentChat, messages: finalMessages });
      } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = { role: 'assistant', content: 'Sorry, there was an error processing your request.' };
        setMessages(prevMessages => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
        setIsBotResponding(false);
      }
    }
  };

  const handleChatNameSubmit = async () => {
    if (newChatName.trim() !== "") {
      const chat = await createNewChat(newChatName);
      setCurrentChat(chat);
      setIsPopupOpen(false);
      setNewChatName("");
    }
  };

  const handleCreateNewChat = () => {
    setCurrentChat(null);
    setMessages([]);
    setIsPopupOpen(true);
  };

  const loadChat = (chat) => {
    if (!isBotResponding) {
      setCurrentChat(chat);
      setMessages(chat.messages || []);
    }
  };

  const clearChatHistory = async () => {
    if (!isBotResponding) {
      try {
        const chatsQuery = query(collection(db, "chats"), where("workbookId", "==", workbook.id));
        const querySnapshot = await getDocs(chatsQuery);
        querySnapshot.forEach(async (chatDoc) => {
          await deleteDoc(doc(db, "chats", chatDoc.id));
        });
        setChatHistory([]);
        setCurrentChat(null);
        setMessages([]);
      } catch (error) {
        console.error('Error clearing chat history:', error);
      }
    }
  };

  const handleCodeSubmit = () => {
    if (codeInput.trim() !== "") {
      const codeMessage = { role: 'user', content: `\`\`\`\n${codeInput}\n\`\`\`` };
      setMessages(prevMessages => [...prevMessages, codeMessage]);
      setCodeInput("");
      setIsCodePopupOpen(false);
      handleSendMessage(codeMessage.content);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h3>{workbook.name}</h3>
        <button 
          className="chat-with-code-button"
          onClick={() => setIsCodePopupOpen(true)}
          disabled={isBotResponding}
        >
          <FaCode /> Chat with Code
        </button>
        <FaTimes className="close-icon" onClick={onClose} />
      </div>
      <div className="chat-container">
        <div className="chat-sidebar">
          <div className="sidebar-content">
            <button 
              className="create-chat-button" 
              onClick={handleCreateNewChat}
              disabled={isBotResponding}
            >
              Create New Chat
            </button>
            <div className="chat-history-header">
              <h4>Chat History</h4>
              <button 
                className="clear-history-button" 
                onClick={clearChatHistory}
                disabled={isBotResponding}
              >
                Clear History
              </button>
            </div>
            <div className="chat-history">
              {chatHistory.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  date={new Date(chat.createdAt).toLocaleString()}
                  name={chat.name || "Unnamed Chat"}
                  onClick={() => loadChat(chat)}
                  disabled={isBotResponding}
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
              disabled={isBotResponding}
            />
            <button onClick={() => handleSendMessage()} disabled={isLoading || isBotResponding}>Send</button>
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <FaTimes className="close-icon" onClick={() => setIsPopupOpen(false)} />
            <h3>Name Your Chat</h3>
            <input
              type="text"
              placeholder="Enter chat name"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
            />
            <button onClick={handleChatNameSubmit}>Submit</button>
          </div>
        </div>
      )}

      {isCodePopupOpen && (
        <div className="popup-overlay">
          <div className="popup code-popup">
            <FaTimes className="close-icon" onClick={() => setIsCodePopupOpen(false)} />
            <h3>Insert Code</h3>
            <div className="code-input-container">
              <textarea
                placeholder="Paste your code here..."
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
              />
              <button onClick={handleCodeSubmit}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;