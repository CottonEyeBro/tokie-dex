import { useEffect, useState } from 'react';
import { useReadContract, useAccount } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { base } from 'wagmi/chains';

export const TOKIEMON_ADDRESS = '0x802187c392b15CDC8df8Aa05bFeF314Df1f65C62';
export const TOKIEMON_ABI_ENDPOINT = 'https://api.basescan.org/api?module=contract&action=getabi&address=0x2441CD8E84c8F75f7734a57352dBE9EfDC991c8E';

// Create a public client for BaseScan
export const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export function useTokiemon() {
  const { address } = useAccount(); // Get the connected user's address
  const [abi, setAbi] = useState([]); // State to store the ABI

  // Step 1: Fetch the ABI from the API endpoint
  useEffect(() => {
      async function fetchABI() {
          try {
              const response = await fetch(ABI_ENDPOINT);
              const data = await response.json();
              setAbi(data); // Set the ABI in state
          } catch (error) {
              console.error('Error fetching ABI:', error);
          }
      }

      fetchABI();
  }, []);

  // Step 2: Get the total NFT count for the user
  const { data: balanceOfData } = useReadContract({
      address: TOKIEMON_ADDRESS,
      abi: abi,
      functionName: 'balanceOf',
      args: [address],
      enabled: !!address && abi.length > 0, // Only run if the user is connected and ABI is loaded
  });

  const totalNFTs = balanceOfData ? Number(balanceOfData) : 0;

  // Step 3: Get the token IDs for each NFT
  const [tokenIds, setTokenIds] = useState([]);
  useEffect(() => {
      async function fetchTokenIds() {
          const ids = [];
          for (let i = 0; i < totalNFTs; i++) {
              const { data: tokenIdData } = useReadContract({
                  address: TOKIEMON_ADDRESS,
                  abi: abi,
                  functionName: 'tokenOfOwnerByIndex',
                  args: [address, i],
                  enabled: !!address && abi.length > 0, // Only run if the user is connected and ABI is loaded
              });

              if (tokenIdData) {
                  ids.push(tokenIdData.toString()); // Convert BigNumber to string
              }
          }
          setTokenIds(ids);
      }

      if (totalNFTs > 0) {
          fetchTokenIds();
      }
  }, [totalNFTs, address, abi]);

  // Step 4: (Optional) Use publicClient to verify data against BaseScan
  useEffect(() => {
      async function verifyData() {
          if (address && abi.length > 0) {
              try {
                  // Example: Verify balanceOf against BaseScan
                  const balanceOnChain = await publicClient.readContract({
                      address: TOKIEMON_ADDRESS,
                      abi: abi,
                      functionName: 'balanceOf',
                      args: [address],
                  });

                  console.log('Balance on BaseScan:', Number(balanceOnChain));

                  // Example: Verify tokenOfOwnerByIndex for the first token
                  if (totalNFTs > 0) {
                      const firstTokenId = await publicClient.readContract({
                          address: TOKIEMON_ADDRESS,
                          abi: abi,
                          functionName: 'tokenOfOwnerByIndex',
                          args: [address, 0],
                      });

                      console.log('First Token ID on BaseScan:', firstTokenId.toString());
                  }
              } catch (error) {
                  console.error('Error verifying data on BaseScan:', error);
              }
          }
      }

      verifyData();
  }, [address, abi, totalNFTs]);

  return {
      totalNFTs,
      tokenIds,
  };
}