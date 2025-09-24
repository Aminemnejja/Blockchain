import React, { useState } from 'react';
import { initializeUser } from '../utils/userManager';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const connectWallet = async () => {
    try {
      if (!window.aptos) {
        setError('Veuillez installer Petra Wallet');
        return;
      }

      await window.aptos.connect();
      const account = await window.aptos.account();
      const userAccount = initializeUser(account.address);
      
      onLogin(userAccount);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Connexion à l'Application</h2>
        <p>Connectez-vous avec votre wallet Petra pour accéder à l'application</p>
        
        <button
          className="connect-wallet-button"
          onClick={connectWallet}
        >
          Connecter Wallet
        </button>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;