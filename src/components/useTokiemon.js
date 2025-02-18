import { useEffect, useState } from 'react';
import { useReadContract } from 'wagmi';
import { TOKIEMON_CONTRACT_ADDRESS, TOKIEMON_ABI, publicClient } from '../contract';

export function useTokiemon(address) {
  const [tokenMetadata, setTokenMetadata] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the number of NFTs owned by the user
  const { data: balance } = useReadContract({
    address: TOKIEMON_CONTRACT_ADDRESS,
    abi: TOKIEMON_ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  // Fetch token IDs and metadata
  useEffect(() => {
    const fetchTokenIdsAndMetadata = async () => {
      if (!balance) return;

      setIsLoading(true);
      setError(null);

      try {
        const metadata = [];
        for (let i = 0; i < balance; i++) {
          // Fetch token ID
          const { data: tokenId } = await publicClient.readContract({
            address: TOKIEMON_CONTRACT_ADDRESS,
            abi: TOKIEMON_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address, i],
          });

          // Fetch token URI
          const { data: tokenURI } = await publicClient.readContract({
            address: TOKIEMON_CONTRACT_ADDRESS,
            abi: TOKIEMON_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
          });

          // Fetch metadata from URI
          const response = await fetch(tokenURI);
          const metadataJson = await response.json();
          metadata.push({ id: tokenId, ...metadataJson });
        }

        setTokenMetadata(metadata);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokenIdsAndMetadata();
  }, [balance, address]);

  return { tokenMetadata, isLoading, error };
}