import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BarChart3, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import CardList from './CardList';
import CreateCard from './CreateCard';
import NumberCrunch from './NumberCrunch';
import SetSettings from './SetSettings';

const SetEditor = ({ onSetUpdated }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [set, setSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('cards');

  useEffect(() => {
    fetchSet();
  }, [id]);

  const fetchSet = async () => {
    try {
      const response = await fetch(`/api/sets/${id}`);
      if (response.ok) {
        const setData = await response.json();
        setSet(setData);
      } else {
        setError('Set not found');
      }
    } catch (error) {
      setError('Failed to load set');
      console.error('Error fetching set:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetUpdate = (updatedSet) => {
    setSet(updatedSet);
    onSetUpdated(updatedSet);
  };

  const handleCardCreated = () => {
    fetchSet(); // Refresh the set data
  };

  const handleCardDeleted = () => {
    fetchSet(); // Refresh the set data
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !set) {
    return (
      <div className="error-state">
        <h3>Error</h3>
        <p>{error || 'Set not found'}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          <ArrowLeft size={20} />
          Back to Sets
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'cards', label: 'Cards', icon: Eye },
    { id: 'create', label: 'Add Card', icon: Plus },
    { id: 'analysis', label: 'Number Crunch', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="btn btn-secondary"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{set.name}</h1>
          {set.description && (
            <p className="text-gray-600 mt-1">{set.description}</p>
          )}
        </div>
      </div>

      {/* Set Stats */}
      <div className="card mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{set.cards.length}</div>
            <div className="text-sm text-gray-500">Cards Created</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{set.total_cards}</div>
            <div className="text-sm text-gray-500">Target Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Math.round((set.cards.length / set.total_cards) * 100)}%
            </div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {set.total_cards - set.cards.length}
            </div>
            <div className="text-sm text-gray-500">Remaining</div>
          </div>
        </div>

        {/* Color Distribution Preview */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Color Distribution</h3>
          <div className="grid grid-cols-5 gap-4">
            {[
              { key: 'white_cards', color: 'white', label: 'W' },
              { key: 'blue_cards', color: 'blue', label: 'U' },
              { key: 'black_cards', color: 'black', label: 'B' },
              { key: 'red_cards', color: 'red', label: 'R' },
              { key: 'green_cards', color: 'green', label: 'G' }
            ].map(({ key, color, label }) => (
              <div key={key} className="text-center">
                <div className={`color-indicator color-${color} mx-auto mb-2`}></div>
                <div className="text-sm text-gray-500">{label}</div>
                <div className="font-medium">{set[key]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map(({ id: tabId, label, icon: Icon }) => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tabId
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'cards' && (
          <CardList
            cards={set.cards}
            archetypes={set.archetypes || []}
            totalCards={set.total_cards}
            colorDistribution={set}
            onCardDeleted={handleCardDeleted}
          />
        )}
        
        {activeTab === 'create' && (
          <CreateCard
            setId={set.id}
            archetypes={set.archetypes || []}
            onCardCreated={handleCardCreated}
          />
        )}
        
        {activeTab === 'analysis' && (
          <NumberCrunch setId={set.id} />
        )}
        
        {activeTab === 'settings' && (
          <SetSettings
            set={set}
            onSetUpdated={handleSetUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default SetEditor;
