import { useReadContract, useReadContracts, useAccount } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { base } from 'wagmi/chains';
import { TOKIEMON_ABI } from '../abi'; // Import the hardcoded ABI
import { useEffect, useState } from 'react';

export const TOKIEMON_ADDRESS = '0x802187c392b15CDC8df8Aa05bFeF314Df1f65C62';

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export function useTokiemon() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState([]); // State to store NFT data with images
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [isFetched, setIsFetched] = useState(false); // State to track if data has been fetched

  // Step 1: Get total NFT count
  const { data: balanceOfData } = useReadContract({
    address: TOKIEMON_ADDRESS,
    abi: TOKIEMON_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address,
  });

  const totalNFTs = balanceOfData ? Number(balanceOfData) : 0;

  // Step 2: Get token IDs
  const tokenQueries =
    address && totalNFTs > 0
      ? Array.from({ length: totalNFTs }, (_, i) => ({
          address: TOKIEMON_ADDRESS,
          abi: TOKIEMON_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [address, i],
        }))
      : [];

  const { data: tokenIdsData } = useReadContracts({
    contracts: tokenQueries,
    enabled: !!address && totalNFTs > 0,
  });

  const tokenIds = tokenIdsData ? tokenIdsData.map((obj) => obj.result?.toString() || '') : [];

  // Step 3: Fetch tokenURI for each token
  const tokenURIQueries =
    tokenIds.length > 0
      ? tokenIds.map((tokenId) => ({
          address: TOKIEMON_ADDRESS,
          abi: TOKIEMON_ABI,
          functionName: 'tokenURI',
          args: [tokenId],
        }))
      : [];

  const { data: tokenURIData } = useReadContracts({
    contracts: tokenURIQueries,
    enabled: tokenIds.length > 0,
  });

  // Step 4: Fetch metadata from tokenURI
  useEffect(() => {
    const fetchMetadata = async () => {
      if (!isFetched && tokenURIData && tokenIds.length > 0) {
        setIsLoading(true); // Set loading state to true
  
        try {

const nftData = await Promise.all(
  tokenURIData.map(async (uriData, index) => {
    const tokenId = tokenIds[index];
    const uri = uriData.result;

    if (uri) {
      try {
        // Fetch metadata JSON from the tokenURI
        const response = await fetch(uri);
        const metadata = await response.json();

        // Extract community, rarity, and tier from attributes
        let community = '';
        let rarity = '';
        let tier = '';

        if (metadata.attributes) {
          metadata.attributes.forEach(attribute => {
            switch (attribute.trait_type) {
              case 'Community':
                community = attribute.value;
                break;
              case 'Rarity':
                rarity = attribute.value;
                break;
              case 'Purchase Tier':
                tier = attribute.value;
                break;
              default:
                break;
            }
          });
        }

        return {
          id: tokenId,
          community,
          name: metadata.name || '', // From tokenURI
          tier,
          rarity,
          image: metadata.image || '', // From tokenURI
        };
      } catch (error) {
        console.error(`Error fetching metadata for token ${tokenId}:`, error);
        return {
          id: tokenId,
          community: '',
          name: '',
          tier: '',
          rarity: '',
          image: '',
        };
      }
    }
    return {
      id: tokenId,
      community: '',
      name: '',
      tier: '',
      rarity: '',
      image: '',
    };
  })
);
          // Update the NFTs state with the fetched data
          setNfts(nftData);
          setIsFetched(true); // Mark data as fetched
        } finally {
          setIsLoading(false); // Set loading state to false
        }
      }
    };
  
    fetchMetadata();
  }, [tokenURIData, tokenIds, isFetched]);
  

  return { totalNFTs, nfts, isLoading };
}