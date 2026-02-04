import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Navbar, Footer } from './components';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar user={user} cartCount={cartCount} onLogout={handleLogout} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Add more routes here */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

// Temporary Home component - move to pages folder later
function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to RetailHub</h1>
      <p className="text-gray-600">Your one-stop shop for everything!</p>
    </div>
  );
}

export default App;
