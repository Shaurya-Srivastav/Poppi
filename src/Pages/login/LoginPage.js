import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import './LoginPage.css';
import TopBubble from '../../Assets/TopBubble.png';
import BottomBubble from '../../Assets/BottomBubble.png';

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleForm = () => {
    setIsCreatingAccount(!isCreatingAccount);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing in with password and email', error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error signing up with email and password', error);
    }
  };

  return (
    <div className="login-page">
      <div className="header">
        <img src={TopBubble} className="bubble" alt="Top Bubble" />
      </div>
      <div className="form-container">
        <div className={`form ${isCreatingAccount ? 'shift-left' : ''}`}>
          <div className="form-content">
            <h1>Welcome to United’s Travel Companion: Poppi</h1>
            {isCreatingAccount ? (
              <form onSubmit={handleSignup}>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label>Password:</label>
                <div className="password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="eye-icon" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                <label>Re-enter password:</label>
                <div className="password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <div className="eye-icon" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                <button type="submit">Submit</button>
                <a href="#" onClick={toggleForm}>Return to Sign In</a>
              </form>
            ) : (
              <form onSubmit={handleLogin}>
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <label>Password:</label>
                <div className="password-container">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <div className="eye-icon" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
                <button type="submit">Submit</button>
                <a href="#">Forgot Your Password? | Need Help</a>
                <hr />
                <a href="#" onClick={toggleForm}>Create an Account</a>
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="footer">
        <img src={BottomBubble} className="bubble" alt="Bottom Bubble" />
      </div>
    </div>
  );
};

export default LoginPage;
