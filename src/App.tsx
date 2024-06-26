import React, { useEffect, useState } from 'react';
import './App.css';
import Router from 'Components/Router';
import { Layout } from 'Components/Layout';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from 'firebaseApp';
import { ToastContainer } from 'react-toastify';
import Loader from 'Components/loader/Loader';

import { RecoilRoot } from 'recoil';

import 'react-toastify/dist/ReactToastify.css';

function App() {
  const auth = getAuth(app);
  const [init, setInit] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!auth?.currentUser
  );
  useEffect(() => {
    onAuthStateChanged(auth, (user: any) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setInit(true);
    });
  }, [auth]);
  return (
    <RecoilRoot>
      <Layout>
        <ToastContainer
          theme='light'
          hideProgressBar
          autoClose={1000}
          newestOnTop
        />
        {init ? <Router isAuthenticated={isAuthenticated} /> : <Loader />}
      </Layout>
    </RecoilRoot>
  );
}

export default App;
