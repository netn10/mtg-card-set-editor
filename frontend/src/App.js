import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { Plus, BarChart3 } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import SetList from './components/SetList';
import SetEditor from './components/SetEditor';
import CreateSet from './components/CreateSet';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

// Navigation component with active state detection
const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="app-nav" aria-label="Primary">
      <NavLink 
        to="/" 
        className={({ isActive }) => `nav-chip ${isActive || location.pathname.startsWith('/set') ? 'is-active' : ''}`}
        end
      >
        <BarChart3 size={16} aria-hidden="true" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink 
        to="/create" 
        className={({ isActive }) => `nav-chip ${isActive ? 'is-active' : ''}`}
      >
        <Plus size={16} aria-hidden="true" />
        <span>Create Set</span>
      </NavLink>
    </nav>
  );
};

function App() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      const response = await fetch('/api/sets');
      const data = await response.json();
      setSets(data);
    } catch (error) {
      console.error('Error fetching sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSet = (newSet) => {
    setSets([...sets, newSet]);
  };

  const updateSet = (updatedSet) => {
    setSets(sets.map(set => set.id === updatedSet.id ? updatedSet : set));
  };

  const deleteSet = (setId) => {
    setSets(sets.filter(set => set.id !== setId));
  };

  return (
    <ThemeProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <div className="app-gradient" aria-hidden="true"></div>
            <header className="app-shell-header">
              <div className="container header-inner">
                <Link to="/" className="brand">
                  <span className="brand-mark" aria-hidden="true">MTG</span>
                  <div className="brand-copy">
                    <span className="brand-title">Magic Card Studio</span>
                    <span className="brand-subtitle">Design custom expansions with confidence</span>
                  </div>
                </Link>
                <div className="header-actions">
                  <Navigation />
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <main className="app-shell-main" role="main">
              <div className="container main-container">
                <Routes>
                  <Route 
                    path="/" 
                    element={
                      <SetList 
                        sets={sets} 
                        loading={loading} 
                        onDelete={deleteSet}
                        onUpdate={fetchSets}
                      />
                    } 
                  />
                  <Route 
                    path="/create" 
                    element={
                      <CreateSet 
                        onSetCreated={addSet}
                      />
                    } 
                  />
                  <Route 
                    path="/set/:id" 
                    element={
                      <SetEditor 
                        onSetUpdated={updateSet}
                      />
                    } 
                  />
                </Routes>
              </div>
            </main>

            <footer className="app-shell-footer">
              <div className="container footer-inner">
                <p className="footer-title">Craft better sets, faster.</p>
                <p className="footer-copy">Magic Card Studio keeps your custom designs organised while highlighting what still needs attention.</p>
              </div>
            </footer>
          </div>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
