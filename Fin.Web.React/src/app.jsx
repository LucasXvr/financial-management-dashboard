import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import "./styles/global.css"
import { AuthProvider } from './contexts/AuthContext';

import Dashboard from './pages/dashboard.jsx';
import Transactions from './pages/transactions.jsx';
import Categories from './pages/categories.jsx';
import Budget from './pages/budget.jsx';
import LandingPage from './pages/landing-page.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import ForgotPassword from './pages/forgot-password.jsx';
import Header from './components/header.jsx';

// PrivateRoute component to protect routes
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App bg-gray-100 dark:bg-gray-900 min-h-screen">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected routes */}
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/transactions" element={
                <PrivateRoute>
                  <Transactions />
                </PrivateRoute>
              } />
              <Route path="/categories" element={
                <PrivateRoute>
                  <Categories />
                </PrivateRoute>
              } />
              <Route path="/budget" element={
                <PrivateRoute>
                  <Budget />
                </PrivateRoute>
              } />

              {/* Redirect any unknown routes to dashboard if authenticated, otherwise to landing page */}
              <Route path="*" element={
                localStorage.getItem('token') 
                  ? <Navigate to="/dashboard" replace /> 
                  : <Navigate to="/" replace />
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App;