import React, { useState } from 'react';
import './App.css';
import Router from 'Components/Router';
import { Layout } from 'Components/Layout';
import { getAuth } from 'firebase/auth';
import { app } from 'firebaseApp';

function App() {
  const auth = getAuth(app);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!auth?.currentUser
  );
  return (
    <Layout>
      <Router />
    </Layout>
  );
}

export default App;
