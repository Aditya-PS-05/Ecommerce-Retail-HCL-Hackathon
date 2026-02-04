import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Add more routes here */}
        </Routes>
      </div>
    </Router>
  );
}

// Temporary Home component - move to pages folder later
function Home() {
  return (
    <div className="home">
      <h1>Welcome to E-Commerce</h1>
      <p>Your one-stop shop for everything!</p>
    </div>
  );
}

export default App;
