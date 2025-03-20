import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, CssBaseline, ThemeProvider, createTheme, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Provider, useDispatch } from 'react-redux';
import store from './store';
import Login from './components/Login';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import { HubConnectionBuilder } from '@microsoft/signalr';
import { getToken, logout, isAuthenticated } from './services/authService';
import { updateTaskInStore } from './store/taskSlice';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function AuthenticatedApp() {
  const dispatch = useDispatch();
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      logout();
      return;
    }

    const token = getToken();
    const newConnection = new HubConnectionBuilder()
      .withUrl('http://localhost:5098/taskHub', { 
        accessTokenFactory: () => token 
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);

    newConnection.start()
      .then(() => {
        console.log('Connected to SignalR Hub');
        
        // Listen for task updates
        newConnection.on('TaskUpdated', (type, payload) => {
          dispatch(updateTaskInStore({ type, payload }));
        });
      })
      .catch(error => {
        console.error('SignalR Connection Error:', error);
        if (error.statusCode === 401) {
          logout();
        }
      });

    return () => {
      if (newConnection) {
        newConnection.stop();
      }
    };
  }, [dispatch]);

  const handleLogout = () => {
    if (connection) {
      connection.stop();
    }
    logout();
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Task Management System
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 3 }}>
        <TaskForm />
        <TaskList />
      </Container>
    </>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={!isAuthenticated() ? <Login /> : <Navigate to="/" />} />
            <Route
              path="/"
              element={isAuthenticated() ? <AuthenticatedApp /> : <Navigate to="/login" />}
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
