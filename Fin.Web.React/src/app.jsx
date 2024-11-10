import { BrowserRouter as Router, Route, Routes, createBrowserRouter } from 'react-router-dom';
import "./styles/global.css"
import Dashboard from './pages/dashboard/dashboard';
import Header from "./components/header/header.jsx";


// const Router = createBrowserRouter([

// ]);

function App() {
  return (
    <Router>
       <div className="App bg-gray-100 dark:bg-gray-900 min-h-screen">
        <Header/>
        <Routes>
          <Route path="/" element={< Dashboard/>}></Route>
        </Routes>
       </div>
    </Router>
  )
}

export default App;