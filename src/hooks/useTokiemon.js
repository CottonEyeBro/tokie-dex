import { useContractRead } from 'wagmi';

const TOKIEMON_CONTRACT_ADDRESS = '0x...'; // Replace with the actual contract address
const TOKIEMON_ABI = []; // Replace with the actual ABI

export function useTokiemon(address) {
  const { data, isLoading, error } = useContractRead({
    address: TOKIEMON_CONTRACT_ADDRESS,
    abi: TOKIEMON_ABI,
    functionName: 'getUserTokiemon',
    args: [address],
  });

  return { data, isLoading, error };
}