import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useTokiemon } from '../hooks/useTokiemon';

export default function WalletConnector() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();
  const { totalNFTs } = useTokiemon();

  return (
    <div>
      {isConnected ? (
        totalNFTs === 0 ? (
          <div>
            <h3>Your Tokiemon Collection</h3>
            <div id="wallet-info">
              <span id="wallet-address">Connected: {address}</span>
              <button id='disconnect-button' onClick={() => disconnect()}>Disconnect</button>
            </div>
            <p>You don't own any Tokiemon yet.</p>
          </div>
        ) : (
          <div>
            <h3>Your Tokiemon Collection</h3>
            <div id="wallet-info">
              <span id="wallet-address">Connected: {address}</span>
              <button id='disconnect-button' onClick={() => disconnect()}>Disconnect</button>
            </div>
          </div>
        )
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