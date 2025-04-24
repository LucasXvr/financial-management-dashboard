import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import "./styles/global.css"

import Dashboard from './pages/dashboard.jsx';
import Transactions from './pages/transactions.jsx';
import Categories from './pages/categories.jsx';
import Budget from './pages/budget.jsx';
import LandingPage from './pages/landing-page.jsx';
import Login from './pages/login.jsx';
import Register from './pages/register.jsx';
import ForgotPassword from './pages/forgot-password.jsx';
import AuthLayout from './components/authLayout.jsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected routes */}
          <Route element={<AuthLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/budget" element={<Budget />} />
          </Route>

          {/* Redirect any unknown routes to dashboard if authenticated, otherwise to landing page */}
          <Route path="*" element={
            localStorage.getItem('token') 
              ? <Navigate to="/dashboard" replace /> 
              : <Navigate to="/" replace />
          } />
        </Routes>
      </div>
    </Router>
  )
}

export default App;