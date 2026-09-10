export default function Faq() {
  const items = [
    { q: 'What do I need to use this marketplace?', a: 'You need the MetaMask browser extension or mobile app, plus some BOT for gas and purchases.' },
    { q: 'Which network does it use?', a: 'Crypto MarketPlace runs on BOT Chain Mainnet (chain ID 677).' },
    { q: 'Do I need an account or email?', a: 'No. Your MetaMask wallet address is your identity.' },
    { q: 'How do sellers get paid?', a: 'When a buyer clicks Buy and confirms the transaction, BOT is sent directly to the seller address.' },
    { q: 'Can a seller buy their own item?', a: 'No. The smart contract prevents self-purchases.' },
    { q: 'Can an item be bought twice?', a: 'No. Once an item is sold, the contract rejects further purchases.' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">FAQ</h1>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 p-5">
            <h3 className="font-semibold text-stone-900 mb-2">{item.q}</h3>
            <p className="text-stone-600 text-sm">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
