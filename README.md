# Crypto MarketPlace

A simple, peer-to-peer marketplace that runs on **BOT Chain Mainnet**.

Sellers list items with a title, description, image URL, and a price in BOT. Buyers connect with MetaMask, switch to BOT Chain, and purchase items directly through the smart contract. The BOT payment is transferred to the seller immediately, and the item is marked as sold on-chain.

## Features

- One minimal `Marketplace` Solidity contract
- No backend, no database, no user accounts
- MetaMask wallet connection with BOT Chain network switching
- Create and browse real on-chain listings
- Buy items with native BOT
- View transactions on BOTScan

## Network

- **Network:** BOT Chain Mainnet
- **Chain ID:** 677
- **RPC:** https://rpc.botchain.ai/
- **Explorer:** https://scan.botchain.ai/
- **Native token:** BOT

## Contract

- **Marketplace:** `0xaAc77c5619c2282a6D1808cD01cFD362C2B71471`
- **Verified on BOTScan:** https://scan.botchain.ai/address/0xaAc77c5619c2282a6D1808cD01cFD362C2B71471

## Development

```bash
npm install
npm run compile
npm run deploy
npm run build
npm run dev
```

## Tech stack

- React + Vite
- Tailwind CSS
- Ethers.js
- Hardhat
