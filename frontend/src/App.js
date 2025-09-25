import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Plus, Settings, BarChart3, CreditCard } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import SetList from './components/SetList';
import SetEditor from './components/SetEditor';
import CreateSet from './components/CreateSet';
import ThemeToggle from './components/ThemeToggle';
import './App.css';

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
      <Router>
        <div className="App">
          <header className="app-header">
            <div className="container">
              <div className="flex items-center justify-between">
                <Link to="/" className="logo">
                  <CreditCard className="logo-icon" />
                  <span>MTG Set Editor</span>
                </Link>
                <div className="flex items-center gap-4">
                  <nav className="nav">
                    <Link to="/" className="nav-link">
                      <BarChart3 size={20} />
                      Sets
                    </Link>
                    <Link to="/create" className="nav-link">
                      <Plus size={20} />
                      New Set
                    </Link>
                  </nav>
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
    </ThemeProvider>
  );
}

export default App;
