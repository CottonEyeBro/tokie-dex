import { useState } from 'react';
import { useAccount } from 'wagmi';
import WalletConnector from './components/WalletConnector';
import { useTokiemon } from './hooks/useTokiemon';

export default function App() {
  const { address, isConnected } = useAccount();
  const { tokenMetadata, isLoading, error } = useTokiemon(address);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  const filteredTokiemon = tokenMetadata
    ?.filter((mon) =>
      mon.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

  console.log(filteredTokiemon)

  return (
    <div>
      <h1>Welcome to the Tokiedex!</h1>
      <WalletConnector />
      {isConnected && (
        <div>
          <input
            type="text"
            placeholder="Search Tokiemon"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
          {isLoading ? (
            <p>Loading Tokiemon...</p>
          ) : error ? (
            <p>Error: {error.message}</p>
          ) : (
            <div>
              <h2>Your Tokiemon</h2>
              <ul>
                {filteredTokiemon.map((mon) => (
                  <li key={mon.id}>{mon.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}