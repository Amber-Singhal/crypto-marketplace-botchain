require('dotenv').config();
require('@nomicfoundation/hardhat-ethers');

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

module.exports = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    botchain: {
      url: 'https://rpc.botchain.ai/',
      chainId: 677,
      accounts: [PRIVATE_KEY],
    },
  },
};
