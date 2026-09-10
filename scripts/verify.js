const fs = require('fs');
const path = require('path');
require('dotenv').config();

const address = process.env.CONTRACT_ADDRESS || process.argv[2];
const source = fs.readFileSync(path.resolve(__dirname, '..', 'contracts', 'Marketplace.sol'), 'utf8');

const params = new URLSearchParams({
  module: 'contract',
  action: 'verify',
  addressHash: address,
  name: 'Marketplace',
  compilerVersion: 'v0.8.19+commit.7dd6d404',
  optimization: 'true',
  optimizationRuns: '200',
  contractSourceCode: source,
  evmVersion: 'paris',
});

fetch('https://scan.botchain.ai/api', {
  method: 'POST',
  body: params,
})
  .then((res) => res.json())
  .then((json) => console.log('Verify response:', JSON.stringify(json, null, 2)))
  .catch((err) => console.error('Verify error:', err.message));
