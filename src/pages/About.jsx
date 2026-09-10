export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">About Crypto MarketPlace</h1>
      <p className="text-stone-600 mb-4">
        Crypto MarketPlace is a simple, peer-to-peer marketplace that lives entirely on BOT Chain Mainnet.
        Sellers list items with a title, description, image, and price. Buyers purchase them directly with BOT.
      </p>
      <p className="text-stone-600 mb-4">
        There is no backend, no database, and no user accounts. Every listing, purchase, and payment is recorded
        on the blockchain and can be verified on BOTScan.
      </p>
      <p className="text-stone-600">
        All you need is MetaMask and a little BOT to start buying or selling.
      </p>
    </div>
  );
}
