import React, { useState } from 'react';
import { useTokiemon } from './hooks/useTokiemon';
import { useAccount } from 'wagmi';
import WalletConnector from './components/WalletConnector';

export default function App() {
  const { isConnected } = useAccount(); // Get wallet connection status
  const { totalNFTs, nfts } = useTokiemon(); // Fetch Tokiemon data

  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [sortOrder, setSortOrder] = useState('asc'); // Sorting order state

  // Step 1: Filter and sort Tokiemon based on user input
  const filteredTokiemon = nfts
    .filter((tokiemon) =>
      tokiemon.id.includes(searchQuery) ||
      tokiemon.community.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => (sortOrder === 'asc' ? a.id - b.id : b.id - a.id));

  return (
    <div>
      <h1>Welcome to your Tokiedex</h1>

      {isConnected ? (
        <div>
          <WalletConnector />
          <h2>Your Collection</h2>

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by ID or community..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Sort Toggle */}
          <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
            Sort by ID: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>

          {/* Tokiemon List */}
          <span>Total Tokiemon: {totalNFTs}</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {filteredTokiemon.map((tokiemon) => (
              <div
                key={tokiemon.id}
                style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}
              >
                <h3>ID: {tokiemon.id}</h3>
                <p>Community: {tokiemon.community}</p>
                <p>Name: {tokiemon.name}</p>
                <p>Tier: {tokiemon.tier}</p>
                <p>Rarity: {tokiemon.rarity}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <WalletConnector />
          <p>Please connect your wallet to view your Tokiemon collection.</p>
        </div>
      )}
    </div>
  );
}