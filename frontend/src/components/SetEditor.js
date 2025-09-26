import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, BarChart3, Settings, Eye } from 'lucide-react';
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

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const parsed = new Date(dateString);
    return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
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

  const handleTabKeyDown = (e) => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    if (currentIndex === -1) return;
    if (e.key === 'ArrowRight') {
      const next = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[next].id);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prev = (currentIndex - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[prev].id);
      e.preventDefault();
    } else if (e.key === 'Home') {
      setActiveTab(tabs[0].id);
      e.preventDefault();
    } else if (e.key === 'End') {
      setActiveTab(tabs[tabs.length - 1].id);
      e.preventDefault();
    }
  };

  return (
    <div className="set-editor">
      <section className="set-hero card">
        <div className="set-hero__header">
          <button onClick={() => navigate('/')} className="btn btn-secondary btn-icon" title="Back to sets">
            <ArrowLeft size={18} />
          </button>
          <div className="set-hero__meta">
            <h1 className="set-hero__title">{set.name}</h1>
            {set.description && <p className="set-hero__description">{set.description}</p>}
            <div className="set-hero__chips">
              <span className="set-chip">{set.cards.length} cards created</span>
              <span className="set-chip">Target {set.total_cards}</span>
              <span className="set-chip">Created {formatDate(set.created_at)}</span>
            </div>
          </div>
          <div
            className="set-hero__progress"
            style={{ '--progress': Math.round((set.cards.length / set.total_cards) * 100) }}
          >
            <span className="set-hero__progress-value">
              {Math.round((set.cards.length / set.total_cards) * 100)}%
            </span>
            <span className="set-hero__progress-label">Complete</span>
          </div>
        </div>

        <div className="set-hero__stats">
          <div className="set-hero__stat">
            <span className="set-hero__stat-label">Remaining cards</span>
            <span className="set-hero__stat-value">{set.total_cards - set.cards.length}</span>
          </div>
          <div className="set-hero__stat">
            <span className="set-hero__stat-label">Archetypes</span>
            <span className="set-hero__stat-value">{set.archetypes?.length || 0}</span>
          </div>
          <div className="set-hero__stat">
            <span className="set-hero__stat-label">Last updated</span>
            <span className="set-hero__stat-value">{formatDate(set.updated_at || set.created_at)}</span>
          </div>
        </div>

        <div className="set-hero__colors" aria-label="Color distribution overview">
          {[
            { key: 'white_cards', color: 'white', label: 'White' },
            { key: 'blue_cards', color: 'blue', label: 'Blue' },
            { key: 'black_cards', color: 'black', label: 'Black' },
            { key: 'red_cards', color: 'red', label: 'Red' },
            { key: 'green_cards', color: 'green', label: 'Green' }
          ].map(({ key, color, label }) => (
            <div key={key} className="set-hero__color">
              <div className={`color-indicator color-${color}`}></div>
              <span className="set-hero__color-label">{label}</span>
              <span className="set-hero__color-value">{set[key] ?? 0}</span>
            </div>
          ))}
        </div>
      </section>

      <nav className="section-tabs" role="tablist" aria-label="Set editor sections">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`section-tabs__item ${isActive ? 'is-active' : ''}`}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onKeyDown={handleTabKeyDown}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="set-editor__content">
        {activeTab === 'cards' && (
          <section role="tabpanel" id="panel-cards" aria-labelledby="tab-cards">
            <CardList
              cards={set.cards}
              archetypes={set.archetypes || []}
              totalCards={set.total_cards}
              colorDistribution={set}
              onCardDeleted={handleCardDeleted}
            />
          </section>
        )}

        {activeTab === 'create' && (
          <section role="tabpanel" id="panel-create" aria-labelledby="tab-create">
            <CreateCard
              setId={set.id}
              archetypes={set.archetypes || []}
              onCardCreated={handleCardCreated}
            />
          </section>
        )}

        {activeTab === 'analysis' && (
          <section role="tabpanel" id="panel-analysis" aria-labelledby="tab-analysis">
            <NumberCrunch setId={set.id} />
          </section>
        )}

        {activeTab === 'settings' && (
          <section role="tabpanel" id="panel-settings" aria-labelledby="tab-settings">
            <SetSettings set={set} onSetUpdated={handleSetUpdate} />
          </section>
        )}
      </div>
    </div>
  );
};

export default SetEditor;
