// Login.js
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Grid,
} from '@mui/material';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { toast } from 'react-toastify';
const Login = ({ isNewUser, toggleMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(getAuth(), email, password);
      toast.success('Sign in successful');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Error signing in');
    }
  };
  
  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(getAuth(), email, password);
      toast.success('Sign up successful');
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error('Error signing up');
    }
  };
  return (
    <Grid sx={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center', gap:'12px',maxWidth:'450px',margin:'0 auto', backgroundColor:'lightgray',padding:'4%'}}>
      <Typography variant="h5" style={{ margin: '20px 0' }}>
        {isNewUser ? 'Create an account' : 'Log in to continue'}
      </Typography>
      <TextField
        label="Email"
        type="email"
        variant="outlined"
        size="small"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        size="small"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={isNewUser ? handleSignUp : handleSignIn}
      >
        {isNewUser ? 'Sign Up' : 'Log In'}
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={toggleMode}
      >
        {isNewUser ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
      </Button>
    </Grid>
  );
};

export default Login;
