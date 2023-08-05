
import React, { useState } from 'react';
import { AuthProvider } from './components/Auth';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './App.css';

const App = () => {
  const [isNewUser, setIsNewUser] = useState(false);

  const toggleMode = () => {
    setIsNewUser(prev => !prev);
  };

  return (
    <AuthProvider>
      {user => (
        <div className="App">
          {user ? (
            <Dashboard user={user} />
          ) : (
            <Login isNewUser={isNewUser} toggleMode={toggleMode} />
          )}
        </div>
      )}
    </AuthProvider>
  );
};

export default App;
