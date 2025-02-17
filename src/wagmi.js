import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, sepolia], // Add the chains you want to support
  connectors: [injected()], // Use the injected connector (e.g., MetaMask)
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});