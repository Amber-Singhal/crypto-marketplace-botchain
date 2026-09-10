import MarketplaceAbi from './abi/Marketplace.json';

export const BOT_CHAIN = {
  chainId: 677,
  hexChainId: '0x2a5',
  name: 'BOT Chain Mainnet',
  rpc: 'https://rpc.botchain.ai/',
  explorer: 'https://scan.botchain.ai/',
  nativeCurrency: {
    name: 'BOT',
    symbol: 'BOT',
    decimals: 18,
  },
};

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0xaAc77c5619c2282a6D1808cD01cFD362C2B71471';

export const ABI = MarketplaceAbi.abi;
