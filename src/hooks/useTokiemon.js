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

  const tokenIds = tokenIdsData ? tokenIdsData.map((obj) => obj.result?.toString() || '') : [];

  // Step 3: Fetch Metadata using `getTokiemonData`
  const metadataQueries =
    tokenIds.length > 0
      ? tokenIds.map((tokenId) => ({
          address: TOKIEMON_ADDRESS,
          abi: TOKIEMON_ABI,
          functionName: 'getTokiemonData',
          args: [tokenId],
        }))
      : [];

  const { data: metadataData } = useReadContracts({
    contracts: metadataQueries,
    enabled: tokenIds.length > 0,
  });

  // Step 4: Format Metadata
  const nfts = tokenIds.map((tokenId, index) => {
    const metadata = metadataData?.[index]?.result || [];
    return {
      id: tokenId?.toString() || '',
      community: metadata[0]?.toString() || '',
      name: metadata[1]?.toString() || '',
      tier: metadata[2]?.toString() || '',
      rarity: metadata[3]?.toString() || '',
    };
  });

  return {
    totalNFTs,
    nfts, // Each NFT has id, community, name, tier, rarity
  };
}