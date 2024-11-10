import { BrowserRouter as Router, Route, Routes, createBrowserRouter } from 'react-router-dom';
import "./styles/global.css"
import Dashboard from './pages/dashboard/dashboard';

// const Router = createBrowserRouter([

// ]);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={< Dashboard/>}></Route>
      </Routes>
    </Router>
  )
}

export default App;