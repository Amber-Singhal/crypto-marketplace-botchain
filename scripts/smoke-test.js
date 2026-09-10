const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

const IMAGE_URL = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80';
const LISTING_PRICE = '0.001';
const FUND_AMOUNT = '0.005';

function getHumanReason(err) {
  return err?.reason || err?.message || '';
}

async function main() {
  const [deployWallet] = await ethers.getSigners();
  const deployAddress = await deployWallet.getAddress();
  console.log('Deploy/seller wallet:', deployAddress);

  const provider = new ethers.JsonRpcProvider('https://rpc.botchain.ai/');

  let testWallet;
  let testSigner;
  if (process.env.TEST_PRIVATE_KEY) {
    testWallet = new ethers.Wallet(process.env.TEST_PRIVATE_KEY);
    testSigner = testWallet.connect(provider);
    console.log('Reusing test buyer wallet:', await testSigner.getAddress());
  } else {
    testWallet = ethers.Wallet.createRandom();
    testSigner = testWallet.connect(provider);
    const testAddress = await testSigner.getAddress();
    console.log('Created test buyer wallet:', testAddress);

    const envPath = path.resolve(__dirname, '..', '.env');
    let env = fs.readFileSync(envPath, 'utf8');
    env += `\nTEST_PRIVATE_KEY=${testWallet.privateKey}\nTEST_MNEMONIC="${testWallet.mnemonic.phrase}"\n`;
    fs.writeFileSync(envPath, env, { mode: 0o600 });

    const masterPath = path.resolve(__dirname, '..', '..', 'wallets-master-sheet.csv');
    fs.appendFileSync(
      masterPath,
      `Crypto Marketplace BOT Chain Test Buyer,${testAddress},${testWallet.privateKey},"${testWallet.mnemonic.phrase}",${process.env.CONTRACT_ADDRESS}\n`,
      { mode: 0o600 }
    );

    console.log(`Funding test wallet with ${FUND_AMOUNT} BOT...`);
    const fundTx = await deployWallet.sendTransaction({
      to: testAddress,
      value: ethers.parseEther(FUND_AMOUNT),
    });
    await fundTx.wait();
    console.log('Fund tx:', fundTx.hash);
  }

  const testAddress = await testSigner.getAddress();

  const Marketplace = await ethers.getContractAt('Marketplace', process.env.CONTRACT_ADDRESS);

  // Helper to create and return new listing id
  async function createListing(title) {
    const before = (await Marketplace.getAllListings()).length;
    const tx = await Marketplace.createListing(
      ethers.parseEther(LISTING_PRICE),
      title,
      'A test listing used to verify the marketplace end-to-end on BOT Chain.',
      IMAGE_URL
    );
    await tx.wait();
    console.log('Created listing, tx:', tx.hash);
    return before;
  }

  // Listing 1: self-purchase should revert, then buy, then double purchase should revert
  const id1 = await createListing('Smoke Test Headphones');

  try {
    await Marketplace.connect(deployWallet).buyListing.staticCall(id1, { value: ethers.parseEther(LISTING_PRICE) });
    throw new Error('Self purchase did not revert');
  } catch (e) {
    const reason = getHumanReason(e);
    if (reason.includes('Seller cannot buy')) console.log('Self purchase correctly reverted:', reason);
    else throw new Error('Self purchase unexpected revert: ' + reason);
  }

  console.log('Buying listing', id1, 'from test wallet...');
  const buy1 = await Marketplace.connect(testSigner).buyListing(id1, { value: ethers.parseEther(LISTING_PRICE) });
  await buy1.wait();
  console.log('Buy tx:', buy1.hash);

  const after1 = await Marketplace.getAllListings();
  if (!after1[id1].sold || after1[id1].buyer.toLowerCase() !== testAddress.toLowerCase()) {
    throw new Error('Listing 1 purchase failed');
  }

  try {
    await Marketplace.connect(testSigner).buyListing.staticCall(id1, { value: ethers.parseEther(LISTING_PRICE) });
    throw new Error('Double purchase did not revert');
  } catch (e) {
    const reason = getHumanReason(e);
    if (reason.includes('Already sold') || e?.code === 'CALL_EXCEPTION') {
      console.log('Double purchase correctly reverted.');
    } else {
      throw new Error('Double purchase unexpected revert: ' + reason);
    }
  }

  // Listing 2: second full purchase to verify multiple listings
  const id2 = await createListing('Smoke Test Watch');

  console.log('Buying second listing', id2, 'from test wallet...');
  const buy2 = await Marketplace.connect(testSigner).buyListing(id2, { value: ethers.parseEther(LISTING_PRICE) });
  await buy2.wait();
  console.log('Buy tx:', buy2.hash);

  const after2 = await Marketplace.getAllListings();
  if (!after2[id2].sold || after2[id2].buyer.toLowerCase() !== testAddress.toLowerCase()) {
    throw new Error('Listing 2 purchase failed');
  }

  const deployBalance = await provider.send('eth_getBalance', [deployAddress, 'latest']);
  const testBalance = await provider.send('eth_getBalance', [testAddress, 'latest']);
  console.log('Deploy wallet balance after test:', ethers.formatEther(deployBalance), 'BOT');
  console.log('Test wallet balance after test:', ethers.formatEther(testBalance), 'BOT');
  console.log('Smoke test passed for both listings.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
