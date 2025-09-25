import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const NumberCrunch = ({ setId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNumberCrunch();
  }, [setId]);

  const fetchNumberCrunch = async () => {
    try {
      const response = await fetch(`/api/sets/${setId}/number-crunch`);
      if (response.ok) {
        const crunchData = await response.json();
        setData(crunchData);
      } else {
        setError('Failed to load number crunch data');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error fetching number crunch:', error);
    } finally {
      setLoading(false);
    }
  };

  const colorMap = {
    white: '#f8f5f0',
    blue: '#0e68ab',
    black: '#150b00',
    red: '#d3202a',
    green: '#00733e',
    colorless: '#c5c5c5',
    multicolor: '#c9aa71'
  };

  const rarityColors = {
    common: '#6b7280',
    uncommon: '#3b82f6',
    rare: '#f59e0b',
    mythic: '#ef4444'
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="error-state">
        <h3>Error</h3>
        <p>{error || 'No data available'}</p>
      </div>
    );
  }

  // Prepare data for charts
  const colorData = [
    { name: 'White', target: data.target_distribution.white_cards, actual: data.actual_distribution.white_cards, color: colorMap.white },
    { name: 'Blue', target: data.target_distribution.blue_cards, actual: data.actual_distribution.blue_cards, color: colorMap.blue },
    { name: 'Black', target: data.target_distribution.black_cards, actual: data.actual_distribution.black_cards, color: colorMap.black },
    { name: 'Red', target: data.target_distribution.red_cards, actual: data.actual_distribution.red_cards, color: colorMap.red },
    { name: 'Green', target: data.target_distribution.green_cards, actual: data.actual_distribution.green_cards, color: colorMap.green },
    { name: 'Colorless', target: data.target_distribution.colorless_cards, actual: data.actual_distribution.colorless_cards, color: colorMap.colorless },
    { name: 'Multicolor', target: data.target_distribution.multicolor_cards, actual: data.actual_distribution.multicolor_cards, color: colorMap.multicolor }
  ];

  const rarityData = [
    { name: 'Common', value: data.rarity_distribution.common, color: rarityColors.common },
    { name: 'Uncommon', value: data.rarity_distribution.uncommon, color: rarityColors.uncommon },
    { name: 'Rare', value: data.rarity_distribution.rare, color: rarityColors.rare },
    { name: 'Mythic', value: data.rarity_distribution.mythic, color: rarityColors.mythic }
  ];

  const getStatusIcon = (target, actual) => {
    if (actual === target) return '✅';
    if (actual < target) return '⚠️';
    return '🔴';
  };

  const getStatusColor = (target, actual) => {
    if (actual === target) return 'text-green-600';
    if (actual < target) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="text-primary" size={24} />
        <h2 className="text-2xl font-bold">Number Crunch Analysis</h2>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary">{data.actual_distribution.total_cards}</div>
          <div className="text-sm text-gray-500">Cards Created</div>
          <div className="text-xs text-gray-400">Target: {data.target_distribution.total_cards}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary">
            {Math.round((data.actual_distribution.total_cards / data.target_distribution.total_cards) * 100)}%
          </div>
          <div className="text-sm text-gray-500">Completion</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary">
            {data.target_distribution.total_cards - data.actual_distribution.total_cards}
          </div>
          <div className="text-sm text-gray-500">Remaining</div>
        </div>
      </div>

      {/* Color Distribution Chart */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Color Distribution</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={colorData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="target" fill="#e5e7eb" name="Target" />
              <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Color Distribution Table */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Color Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Color</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Target</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Actual</th>
                <th className="text-right py-3 px-4 font-medium text-gray-700">Difference</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {colorData.map(({ name, target, actual, color }) => {
                const difference = actual - target;
                return (
                  <tr key={name} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: color }}
                        ></div>
                        {name}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-medium">{target}</td>
                    <td className="text-right py-3 px-4 font-medium">{actual}</td>
                    <td className={`text-right py-3 px-4 font-medium ${getStatusColor(target, actual)}`}>
                      {difference > 0 ? '+' : ''}{difference}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-lg">
                        {getStatusIcon(target, actual)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rarity Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Rarity Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rarityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {rarityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Rarity Breakdown</h3>
          <div className="space-y-3">
            {rarityData.map(({ name, value, color }) => (
              <div key={name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm font-medium">{name}</span>
                </div>
                <div className="text-sm font-medium">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <AlertCircle className="text-yellow-500" size={20} />
          Recommendations
        </h3>
        <div className="space-y-2">
          {colorData.map(({ name, target, actual }) => {
            const difference = target - actual;
            if (difference > 0) {
              return (
                <div key={name} className="flex items-center gap-2 text-sm">
                  <span className="text-yellow-500">⚠️</span>
                  <span>Add {difference} more {name.toLowerCase()} card{difference > 1 ? 's' : ''}</span>
                </div>
              );
            } else if (difference < 0) {
              return (
                <div key={name} className="flex items-center gap-2 text-sm">
                  <span className="text-red-500">🔴</span>
                  <span>Remove {Math.abs(difference)} {name.toLowerCase()} card{Math.abs(difference) > 1 ? 's' : ''}</span>
                </div>
              );
            }
            return null;
          })}
          
          {colorData.every(({ target, actual }) => target === actual) && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <span>✅</span>
              <span>Color distribution is perfectly balanced!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NumberCrunch;
