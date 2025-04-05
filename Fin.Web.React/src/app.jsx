import { BrowserRouter as Router, Route, Routes, createBrowserRouter } from 'react-router-dom';
import "./styles/global.css"

import Dashboard from './pages/dashboard.jsx';
import Header from "./components/header.jsx";
import Transactions from './pages/transactions.jsx';
import Categories from './pages/categories.jsx';
import Budget from './pages/budget.jsx';
import LandingPage from './pages/landing-page.jsx';
import Login from './pages/login.jsx';
import PrivateRoute from './components/privateRoute.jsx';

function App() {
  return (
    <Router>
       <div className="App bg-gray-100 dark:bg-gray-900 min-h-screen">
        <Header/>
        <Routes>
          <Route path="/" element={<LandingPage to="/" replace/>}></Route>
          <Route path="/login" element={<Login/>}></Route>
          <Route path="/dashboard" element={<Dashboard to="/dashboard"/>}></Route>
          <Route path="/transactions" element={<Transactions to="/transactions"/>}></Route>
          <Route path="/categories" element={<Categories to="/categories"/>}></Route>
          <Route path="/budget" element={<Budget to="/budget"/>}></Route>
        </Routes>
       </div>
    </Router>
  )
}

export default App;