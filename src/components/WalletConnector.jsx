import { useAccount, useConnect, useDisconnect } from 'wagmi';

export default function WalletConnector() {
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={() => disconnect()}>Disconnect</button>
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