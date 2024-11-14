import { BrowserRouter as Router, Route, Routes, createBrowserRouter } from 'react-router-dom';
import "./styles/global.css"
import Dashboard from './pages/dashboard.jsx';
import Header from "./components/header.jsx";
import Transactions from './pages/transactions.jsx';
import Budget from './pages/budget.jsx';

function App() {
  return (
    <Router>
       <div className="App bg-gray-100 dark:bg-gray-900 min-h-screen">
        <Header/>
        <Routes>
          <Route path="/" element={<Dashboard to="/" replace/>}></Route>
          <Route path="/transactions" element={<Transactions to="/transactions"/>}></Route>
          <Route path="/budget" element={<Budget to="/budget"/>}></Route>
        </Routes>
       </div>
    </Router>
  )
}

export default App;