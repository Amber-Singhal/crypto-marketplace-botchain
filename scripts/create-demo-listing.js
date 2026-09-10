const { ethers } = require('hardhat');

const TITLE = 'Minimal Leather Backpack';
const DESCRIPTION = 'A clean everyday backpack listed as a live demo on the BOT Chain marketplace.';
const IMAGE = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80';
const PRICE = '0.001';

async function main() {
  const envPk = process.env.TEST_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!envPk) throw new Error('No private key in .env');

  const provider = new ethers.JsonRpcProvider('https://rpc.botchain.ai/');
  const wallet = new ethers.Wallet(envPk, provider);
  console.log('Creating demo listing from wallet:', await wallet.getAddress());

  const Marketplace = await ethers.getContractAt('Marketplace', process.env.CONTRACT_ADDRESS, wallet);

  const tx = await Marketplace.createListing(
    ethers.parseEther(PRICE),
    TITLE,
    DESCRIPTION,
    IMAGE
  );
  await tx.wait();
  console.log('Demo listing created, tx:', tx.hash);

  const all = await Marketplace.getAllListings();
  const id = all.length - 1;
  const item = all[id];
  console.log('Listing id:', id, item.title, ethers.formatEther(item.price), 'BOT');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
