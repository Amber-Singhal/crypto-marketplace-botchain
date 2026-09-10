const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const masterSheetPath = path.join(projectRoot, '..', 'wallets-master-sheet.csv');

const wallet = ethers.Wallet.createRandom();

const envContent = `PRIVATE_KEY=${wallet.privateKey}\nMNEMONIC="${wallet.mnemonic.phrase}"\n`;
fs.writeFileSync(envPath, envContent, { mode: 0o600 });

const row = `Crypto Marketplace BOT Chain,${wallet.address},${wallet.privateKey},"${wallet.mnemonic.phrase}",\n`;

if (!fs.existsSync(masterSheetPath)) {
  fs.writeFileSync(masterSheetPath, 'Project,Wallet Address,Private Key,Secret Phrase,Contract Address\n', { mode: 0o600 });
} else {
  fs.chmodSync(masterSheetPath, 0o600);
}
fs.appendFileSync(masterSheetPath, row);

console.log(`Created dedicated wallet for Crypto Marketplace BOT Chain.`);
console.log(`Public address: ${wallet.address}`);
