import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
import './ChatPage.css';
import ChatHistoryItem from '../../components/ChatHistoryItem';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const ChatPage = ({ workbook, onClose }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newChatName, setNewChatName] = useState("");
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

  const createNewChat = async () => {
    const newChat = {
      workbookId: workbook.id,
      name: "New Chat",
      createdAt: new Date().toISOString(),
      messages: []
    };
    const docRef = await addDoc(collection(db, "chats"), newChat);
    const chatWithId = { ...newChat, id: docRef.id };
    setChatHistory(prevHistory => [chatWithId, ...prevHistory]);
    setCurrentChat(chatWithId);
    return chatWithId;
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() !== "") {
      if (!currentChat) {
        const newChat = await createNewChat();
        setCurrentChat(newChat);
        setIsPopupOpen(true);
        return;
      }

      if (!currentChat.name) {
        setIsPopupOpen(true);
        return;
      }

      const userMessage = { role: 'user', content: newMessage };
      const updatedMessages = [...(currentChat.messages || []), userMessage];
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
      }
    }
  };

  const handleChatNameSubmit = async () => {
    if (newChatName.trim() !== "") {
      await updateDoc(doc(db, "chats", currentChat.id), { name: newChatName });
      setCurrentChat(prevChat => ({ ...prevChat, name: newChatName }));
      setIsPopupOpen(false);
      setNewChatName("");
    }
  };

  const handleCreateNewChat = async () => {
    const newChat = await createNewChat();
    setCurrentChat(newChat);
  };

  const loadChat = (chat) => {
    setCurrentChat(chat);
    setMessages(chat.messages);
  };

  const clearChatHistory = async () => {
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
            <button className="create-chat-button" onClick={handleCreateNewChat}>Create New Chat</button>
            <div className="chat-history-header">
              <h4>Chat History</h4>
              <button className="clear-history-button" onClick={clearChatHistory}>Clear History</button>
            </div>
            <div className="chat-history">
              {chatHistory.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  date={new Date(chat.createdAt).toLocaleString()}
                  name={chat.name || "Unnamed Chat"}
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
    </div>
  );
};

export default ChatPage;
