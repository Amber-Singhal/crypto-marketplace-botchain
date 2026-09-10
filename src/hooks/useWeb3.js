import { useCallback, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { ABI, BOT_CHAIN, CONTRACT_ADDRESS } from '../config';

export function useWeb3() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [loading, setLoading] = useState(false);

  const isCorrectNetwork = chainId === BOT_CHAIN.chainId;

  const readContract = useMemo(() => {
    if (!CONTRACT_ADDRESS) return null;
    const p = provider || new ethers.JsonRpcProvider(BOT_CHAIN.rpc);
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, p);
  }, [provider]);

  const writeContract = useMemo(() => {
    if (!CONTRACT_ADDRESS || !signer) return null;
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  }, [signer]);

  const switchToBotChain = useCallback(async () => {
    if (!window.ethereum) throw new Error('MetaMask is not installed.');
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BOT_CHAIN.hexChainId }],
      });
    } catch (switchError) {
      if (switchError?.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: BOT_CHAIN.hexChainId,
              chainName: BOT_CHAIN.name,
              rpcUrls: [BOT_CHAIN.rpc],
              nativeCurrency: BOT_CHAIN.nativeCurrency,
              blockExplorerUrls: [BOT_CHAIN.explorer],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!window.ethereum) return;
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    const network = await browserProvider.getNetwork();
    setChainId(Number(network.chainId));
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts?.[0]) {
      const s = await browserProvider.getSigner();
      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(s);
    } else {
      setProvider(browserProvider);
      setSigner(null);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to use this marketplace.');
    }
    setLoading(true);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await refresh();
      const cid = Number(await window.ethereum.request({ method: 'eth_chainId' }));
      setChainId(cid);
      if (cid !== BOT_CHAIN.chainId) {
        await switchToBotChain();
      }
    } finally {
      setLoading(false);
    }
  }, [refresh, switchToBotChain]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setSigner(null);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
      if (accounts?.[0]) {
        connect();
      } else {
        refresh();
      }
    });

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
      } else {
        setAccount(accounts[0]);
        refresh();
      }
    };
    const handleChainChanged = () => window.location.reload();

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [connect, refresh]);

  return {
    account,
    chainId,
    isCorrectNetwork,
    provider,
    signer,
    readContract,
    writeContract,
    connect,
    disconnect,
    switchToBotChain,
    loading,
  };
}

export function getHumanReadableError(error) {
  const reason = error?.reason || error?.data?.message || error?.message || '';
  const code = error?.code;
  if (code === 'ACTION_REJECTED' || code === 4001) return 'Transaction rejected.';
  if (code === 'INSUFFICIENT_FUNDS' || reason.includes('insufficient funds')) {
    return "You don't have enough BOT to complete this transaction.";
  }
  if (reason.includes('Already sold')) return 'This item has already been sold.';
  if (reason.includes('Seller cannot buy')) return 'You cannot buy your own item.';
  if (reason.includes('Incorrect payment')) return 'The payment amount is incorrect. Please try again.';
  if (reason.includes('Price must be > 0')) return 'Price must be greater than 0.';
  if (reason.includes('Invalid listing')) return 'This listing does not exist.';
  if (reason.includes('user rejected')) return 'Transaction rejected.';
  if (reason.includes('network') || reason.includes('chain')) return 'Please switch to BOT Chain to continue.';
  return 'The transaction could not be completed. Please try again.';
}
