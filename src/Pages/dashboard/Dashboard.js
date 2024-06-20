// src/Pages/dashboard/Dashboard.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import UnitedWhiteLogo from "../../Assets/UnitedWhiteLogo.png";
import { FaBars, FaSignOutAlt, FaSyncAlt, FaTimes, FaTrash } from 'react-icons/fa';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

const Dashboard = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [workbookName, setWorkbookName] = useState("");
  const [workbookDescription, setWorkbookDescription] = useState("");
  const [workbooks, setWorkbooks] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      }
    });

    // Fetch workbooks from Firestore
    const fetchWorkbooks = async () => {
      const querySnapshot = await getDocs(collection(db, "workbooks"));
      const workbooksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setWorkbooks(workbooksData);
    };

    fetchWorkbooks();

    return () => unsubscribe();
  }, [auth, navigate]);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSubmit = async () => {
    const newWorkbook = {
      name: workbookName,
      description: workbookDescription,
    };
    try {
      const docRef = await addDoc(collection(db, "workbooks"), newWorkbook);
      setWorkbooks([...workbooks, { id: docRef.id, ...newWorkbook }]);
      setWorkbookName("");
      setWorkbookDescription("");
      togglePopup();
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "workbooks", id));
      setWorkbooks(workbooks.filter(workbook => workbook.id !== id));
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <img src={UnitedWhiteLogo} className="united-logo" alt="United Logo" />
        <FaBars className="menu-icon" onClick={toggleSidebar} />
      </header>
      <main className="dashboard-content">
        <h2>WorkBooks 🧠</h2>
        <button className="create-workbook-button" onClick={togglePopup}>Create Workbook</button>
        <div className="cards-container">
          {workbooks.map((workbook) => (
            <div className="card" key={workbook.id}>
              <FaTrash className="delete-icon" onClick={() => handleDelete(workbook.id)} />
              <h4>{workbook.name}</h4>
              <p>{workbook.description.split(".")[0]}.</p>
            </div>
          ))}
        </div>
      </main>
      <footer className="dashboard-footer">
        <div className="footer-icons">
          <FaSignOutAlt onClick={handleSignOut} />
          <FaSyncAlt onClick={handleRefresh} />
        </div>
      </footer>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <FaTimes className="close-icon" onClick={togglePopup} />
            <h3>Create Workbook</h3>
            <label htmlFor="workbookName">Workbook Name:</label>
            <input
              type="text"
              id="workbookName"
              value={workbookName}
              onChange={(e) => setWorkbookName(e.target.value)}
              required
            />
            <label htmlFor="workbookDescription">Workbook Description:</label>
            <textarea
              id="workbookDescription"
              value={workbookDescription}
              onChange={(e) => setWorkbookDescription(e.target.value)}
            />
            <button onClick={handleSubmit}>Submit</button>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <>
          <div className="sidebar-overlay" onClick={toggleSidebar}></div>
          <div className="sidebar">
            <FaTimes className="close-icon" onClick={toggleSidebar} />
            <p>Get Help</p>
            <p>Foundry</p>
            <p>Submit Bugs</p>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
