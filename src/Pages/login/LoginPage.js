import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import TopBubble from "../../Assets/TopBubble.png";
import BottomBubble from "../../Assets/BottomBubble.png";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleForm = () => {
    setIsCreatingAccount(!isCreatingAccount);
  };

  const handleLogin = () => {
    // Add logic to handle login
    navigate('/dashboard');
  };

  return (
    <div id="LoginPage">
      <div id="header">
        <img src={TopBubble} className="TopBubble" alt="Top Bubble" />
      </div>
      <div id="formContainer">
        <div className={`form ${isCreatingAccount ? 'shift-left' : 'shift-right'}`}>
          <div className="form-content">
            <h1>Welcome to United’s Travel Companion: Poppi</h1>
            {isCreatingAccount ? (
              <>
                <label>Email:</label>
                <input type="text" />
                <label>Miles Reward Number:</label>
                <input type="text" />
                <label>Password:</label>
                <div className="passwordContainer">
                  <input type={showPassword ? "text" : "password"} />
                  <div className="eyeIcon" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                <label>Re-enter password:</label>
                <div className="passwordContainer">
                  <input type={showPassword ? "text" : "password"} />
                  <div className="eyeIcon" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                <button type="submit">Submit</button>
                <a href="#" onClick={toggleForm}>Return to Sign In</a>
              </>
            ) : (
              <>
                <label>Email/Mile Rewards Number:</label>
                <input type="text" />
                <label>Password:</label>
                <div className="passwordContainer">
                  <input type={showPassword ? "text" : "password"} />
                  <div className="eyeIcon" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                <button type="button" onClick={handleLogin}>Submit</button>
                <a href="#">Forgot Your Password? | Need Help</a>
                <hr />
                <a href="#" onClick={toggleForm}>Create an Account</a>
              </>
            )}
          </div>
        </div>
      </div>
      <div id="footer">
        <img src={BottomBubble} className="BottomBubble" alt="Bottom Bubble" />
      </div>
    </div>
  );
};

export default LoginPage;
