// import FileUpload from './components/FileUpload';

// function App() {
//   return (
//     <div className="App">
//       <FileUpload />
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/Adminpanel';
import FileUpload from './components/FileUpload';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication status from local storage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(authStatus);
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const PrivateRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<LoginPage onLogin={() => setIsAuthenticated(true)} />} 
        />
        <Route 
          path="/admin" 
          element={<PrivateRoute element={<AdminPanel />} />} 
        />
        <Route 
          path="/" 
          element={<Navigate to="/login" />} 
        />
        <Route 
          path="/upload" 
          element={<PrivateRoute element={<FileUpload />} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
