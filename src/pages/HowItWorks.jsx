export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">How it works</h1>
      <ol className="list-decimal list-inside space-y-4 text-stone-600">
        <li>
          <strong className="text-stone-900">Connect MetaMask</strong> and make sure you are on BOT Chain Mainnet.
        </li>
        <li>
          <strong className="text-stone-900">Browse listings</strong> on the marketplace home page.
        </li>
        <li>
          <strong className="text-stone-900">Create a listing</strong> by filling in the title, description, image URL, and price in BOT.
        </li>
        <li>
          <strong className="text-stone-900">Buy an item</strong> by clicking Buy and confirming the exact BOT amount in MetaMask.
        </li>
        <li>
          <strong className="text-stone-900">BOT is transferred</strong> directly to the seller, and the item is marked as sold on-chain.
        </li>
        <li>
          <strong className="text-stone-900">Verify everything</strong> on BOTScan using the transaction links shown in the app.
        </li>
      </ol>
    </div>
  );
}
