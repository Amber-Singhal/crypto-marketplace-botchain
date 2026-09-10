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

  const setConnection = useCallback(async (browserProvider, accounts) => {
    if (!browserProvider) return;
    try {
      const network = await browserProvider.getNetwork();
      setChainId(Number(network.chainId));
    } catch {
      // ignore
    }
    if (accounts?.[0]) {
      try {
        const s = await browserProvider.getSigner();
        setAccount(accounts[0]);
        setSigner(s);
        setProvider(browserProvider);
      } catch {
        setProvider(browserProvider);
        setSigner(null);
      }
    } else {
      setProvider(browserProvider);
      setSigner(null);
      setAccount(null);
    }
  }, []);

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

  const attemptAutoConnect = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      await setConnection(browserProvider, accounts);
    } catch {
      // ignore
    }
  }, [setConnection]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed. Please install MetaMask to use this marketplace.');
    }
    setLoading(true);
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      await setConnection(browserProvider, accounts);
      const network = await browserProvider.getNetwork();
      if (Number(network.chainId) !== BOT_CHAIN.chainId) {
        await switchToBotChain();
      }
    } finally {
      setLoading(false);
    }
  }, [setConnection, switchToBotChain]);

  const disconnect = useCallback(async () => {
    setAccount(null);
    setSigner(null);
    try {
      if (window.ethereum?.request) {
        // Ask MetaMask to revoke the dApp connection so the next reload is truly disconnected
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      }
    } catch {
      // MetaMask may not support wallet_revokePermissions; clear state anyway
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      if (cancelled) return;
      if (window.ethereum) {
        await attemptAutoConnect();
      }
    };

    setup();

    const handleInit = () => {
      if (!cancelled) attemptAutoConnect();
    };
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setAccount(null);
        setSigner(null);
      } else {
        setAccount(accounts[0]);
        attemptAutoConnect();
      }
    };
    const handleChainChanged = () => window.location.reload();

    // MetaMask injects asynchronously; wait for it if not present yet
    window.addEventListener('ethereum#initialized', handleInit);
    window.ethereum?.on('accountsChanged', handleAccountsChanged);
    window.ethereum?.on('chainChanged', handleChainChanged);

    // Fallback: try again after a short delay in case the provider was slow to inject
    const fallback = setTimeout(() => {
      if (!cancelled && window.ethereum) attemptAutoConnect();
    }, 1500);

    return () => {
      cancelled = true;
      clearTimeout(fallback);
      window.removeEventListener('ethereum#initialized', handleInit);
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [attemptAutoConnect]);

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
