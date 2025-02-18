import { useAccount, useReadContract } from 'wagmi';
import { TOKIEMON_CONTRACT_ADDRESS, TOKIEMON_ABI } from '../contract';

export function useTokiemon() {
  const { address } = useAccount();

  // Fetch the number of NFTs owned by the user
  const { data: balance } = useReadContract({
    address: TOKIEMON_CONTRACT_ADDRESS,
    abi: TOKIEMON_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  // Fetch the token IDs of the NFTs owned by the user
  const tokenIds = [];
  if (balance) {
    for (let i = 0; i < balance; i++) {
      const { data: tokenId } = useReadContract({
        address: TOKIEMON_CONTRACT_ADDRESS,
        abi: TOKIEMON_ABI,
        functionName: 'tokenOfOwnerByIndex',
        args: [address, i],
      });
      if (tokenId) tokenIds.push(tokenId);
    }
  }

  return tokenIds;
}