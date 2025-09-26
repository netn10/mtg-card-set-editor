import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Plus, Settings, BarChart3 } from 'lucide-react';
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
    <nav className="tab-navigation">
      <Link 
        to="/" 
        className={`tab-button ${location.pathname === '/' ? 'active' : ''}`}
      >
        <BarChart3 size={16} className="tab-icon" />
        <span>Sets</span>
      </Link>
      <Link 
        to="/create" 
        className={`tab-button ${location.pathname === '/create' ? 'active' : ''}`}
      >
        <Plus size={16} className="tab-icon" />
        <span>New Set</span>
      </Link>
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
            <header className="app-header">
              <div className="container">
                <div className="flex items-center justify-between">
                  <Link to="/" className="logo">
                    <span>MTG Set Editor</span>
                  </Link>
                  <div className="flex items-center gap-6">
                    <Navigation />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </header>

            <main className="main-content">
              <div className="container">
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
          </div>
        </Router>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
