const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with wallet:', deployer.address);

  const Marketplace = await ethers.getContractFactory('Marketplace');
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();

  const contractAddress = await marketplace.getAddress();
  console.log('Marketplace deployed to:', contractAddress);

  const envPath = path.resolve(__dirname, '..', '.env');
  let env = fs.readFileSync(envPath, 'utf8');
  if (/^CONTRACT_ADDRESS=/m.test(env)) {
    env = env.replace(/^CONTRACT_ADDRESS=.*$/m, `CONTRACT_ADDRESS=${contractAddress}`);
  } else {
    env += `CONTRACT_ADDRESS=${contractAddress}\n`;
  }
  if (/^VITE_CONTRACT_ADDRESS=/m.test(env)) {
    env = env.replace(/^VITE_CONTRACT_ADDRESS=.*$/m, `VITE_CONTRACT_ADDRESS=${contractAddress}`);
  } else {
    env += `VITE_CONTRACT_ADDRESS=${contractAddress}\n`;
  }
  fs.writeFileSync(envPath, env, { mode: 0o600 });

  const masterSheetPath = path.resolve(__dirname, '..', '..', 'wallets-master-sheet.csv');
  if (fs.existsSync(masterSheetPath)) {
    const walletAddress = deployer.address.toLowerCase();
    const lines = fs.readFileSync(masterSheetPath, 'utf8').split('\n');
    const updated = lines.map((line) => {
      if (line.toLowerCase().startsWith('crypto marketplace bot chain,')) {
        const fields = line.split(',');
        if (fields.length >= 5 && fields[1].toLowerCase() === walletAddress) {
          fields[4] = contractAddress;
          return fields.join(',');
        }
      }
      return line;
    });
    fs.writeFileSync(masterSheetPath, updated.join('\n'), { mode: 0o600 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
