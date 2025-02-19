import React, { useState, useEffect } from 'react';
import { useTokiemon, TOKIEMON_ADDRESS, publicClient } from './hooks/useTokiemon';
import { useAccount } from 'wagmi';
import WalletConnector from './components/WalletConnector';

function App() {
  const { isConnected } = useAccount(); // Get wallet connection status and address
    const { tokenIds, abi } = useTokiemon(); // Fetch Tokiemon data
    const [tokiemonMetadata, setTokiemonMetadata] = useState([]); // State to store Tokiemon metadata
    const [searchQuery, setSearchQuery] = useState(''); // State for search query
    const [sortOrder, setSortOrder] = useState('asc'); // State for sorting order

  // Step 1: Fetch metadata for each Tokiemon
  useEffect(() => {
      async function fetchMetadata() {
          const metadata = [];
          for (const tokenId of tokenIds) {
              try {
                  const metadataUri = await publicClient.readContract({
                      address: TOKIEMON_ADDRESS,
                      abi: abi,
                      functionName: 'tokenURI',
                      args: [tokenId],
                  });

                  const response = await fetch(metadataUri);
                  const data = await response.json();
                  metadata.push({ ...data, id: tokenId });
              } catch (error) {
                  console.error(`Error fetching metadata for token ${tokenId}:`, error);
              }
          }
          setTokiemonMetadata(metadata);
      }

      if (tokenIds.length > 0) {
          fetchMetadata();
      }
  }, [tokenIds]);

  // Step 2: Filter and sort Tokiemon based on user input
  const filteredTokiemon = tokiemonMetadata
      .filter((tokiemon) =>
          tokiemon.id.includes(searchQuery) ||
          tokiemon.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
          if (sortOrder === 'asc') {
              return a.id - b.id;
          } else {
              return b.id - a.id;
          }
      });

  return (
      <div>
          <h1>Welcome to your Tokiedex</h1>
          <WalletConnector />
          {/* Tokiemon Collection */}
          {isConnected ? (
              <>
                  {/* Search Bar */}
                  <input
                      type="text"
                      placeholder="Search by ID or name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  {/* Sort Toggle */}
                  <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                      Sort by ID: {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </button>

                  {/* Tokiemon List */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                      {filteredTokiemon.map((tokiemon) => (
                          <div key={tokiemon.id} style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px' }}>
                              <img src={tokiemon.image} alt={tokiemon.name} style={{ width: '100px', height: '100px' }} />
                              <h3>{tokiemon.name}</h3>
                              <p>ID: {tokiemon.id}</p>
                              <p>Community: {tokiemon.community}</p>
                              <p>Rarity: {tokiemon.rarity}</p>
                              <p>Tier: {tokiemon.tier}</p>
                          </div>
                      ))}
                  </div>
              </>
          ) : (
              <p>Please connect your wallet to view your Tokiemon collection.</p>
          )}
      </div>
  );
}

export default App;