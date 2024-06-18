// src/LoginPage.js
import React from 'react';
import './LoginPage.css';
import { FaEye } from 'react-icons/fa';
import BottomBubble from "../../Assets/BottomBubble.png";
import TopBubble from "../../Assets/TopBubble.png";

const LoginPage = () => {
  return (
    <div id="LoginPage">
      <div id="header">
        <img src={TopBubble} className="TopBubble" alt="Bottom Bubble" />
      </div>
      <div id="footer">
        <img src={BottomBubble} className="BottomBubble" alt="Bottom Bubble" />
      </div>
    </div>
  );
};

export default LoginPage;
