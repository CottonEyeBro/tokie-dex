import { useReadContract, useReadContracts, useAccount } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { base } from 'wagmi/chains';
import { TOKIEMON_ABI } from '../abi'; // Import the hardcoded ABI

export const TOKIEMON_ADDRESS = '0x802187c392b15CDC8df8Aa05bFeF314Df1f65C62';

export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export function useTokiemon() {
  const { address } = useAccount();

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

  const tokenIds = tokenIdsData ? tokenIdsData.map((id) => id.toString()) : [];

  // Step 3: Fetch Metadata (image, community, rarity, tier)
  const metadataQueries =
    tokenIds.length > 0
      ? tokenIds.map((tokenId) => [
          {
            address: TOKIEMON_ADDRESS,
            abi: TOKIEMON_ABI,
            functionName: 'getTokenImage',
            args: [tokenId],
          },
          {
            address: TOKIEMON_ADDRESS,
            abi: TOKIEMON_ABI,
            functionName: 'getTokenCommunity',
            args: [tokenId],
          },
          {
            address: TOKIEMON_ADDRESS,
            abi: TOKIEMON_ABI,
            functionName: 'getTokenRarity',
            args: [tokenId],
          },
          {
            address: TOKIEMON_ADDRESS,
            abi: TOKIEMON_ABI,
            functionName: 'getTokenTier',
            args: [tokenId],
          },
        ]).flat()
      : [];

  const { data: metadataData } = useReadContracts({
    contracts: metadataQueries,
    enabled: tokenIds.length > 0,
  });

  // Step 4: Format Metadata
  const nfts = tokenIds.map((tokenId, index) => ({
    id: tokenId,
    image: metadataData?.[index * 4]?.toString() || '',
    community: metadataData?.[index * 4 + 1]?.toString() || '',
    rarity: metadataData?.[index * 4 + 2]?.toString() || '',
    tier: metadataData?.[index * 4 + 3]?.toString() || '',
  }));

  return {
    totalNFTs,
    nfts, // Each NFT has id, image, community, rarity, and tier
  };
}
