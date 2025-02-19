import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useTokiemon } from '../hooks/useTokiemon';

export default function WalletConnector() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { totalNFTs } = useTokiemon();

  // Display a message if the user has no NFTs
  if (isConnected && totalNFTs === 0) {
    return (
      <div>
        <h3>Your Tokiemon Collection</h3>
          <p>You don't own any Tokiemon yet.</p>
          <button id='disconnect-button' onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      {isConnected ? (
        <div id="wallet-info">
          <span id="wallet-address">Connected: {address}</span>
          <button id='disconnect-button' onClick={() => disconnect()}>Disconnect</button>
        </div>
      ) : (
        <div>
          {connectors.map((connector) => (
            <button
              key={connector.id}
              onClick={() => {
                console.log('Attempting to connect with:', connector.name); // Log which connector is being used
                connect({ connector });
              }}
            >
              Connect with {connector.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}