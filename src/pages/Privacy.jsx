export default function Privacy() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-stone-900 mb-6">Privacy Policy</h1>
      <p className="text-stone-600 mb-4">
        Crypto MarketPlace does not collect personal information, email addresses, passwords, or usage data.
        The only identifier used is your public MetaMask wallet address, which is stored on the public BOT Chain blockchain.
      </p>
      <p className="text-stone-600 mb-4">
        We do not use cookies, analytics, or third-party trackers.
      </p>
      <p className="text-stone-600">
        Because the marketplace has no backend, no centralized database holds your data.
      </p>
    </div>
  );
}
