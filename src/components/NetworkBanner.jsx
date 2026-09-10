export default function NetworkBanner({ account, isCorrectNetwork, switchToBotChain }) {
  if (!account || isCorrectNetwork) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-amber-900">
          Please switch to BOT Chain to use this marketplace.
        </p>
        <button
          onClick={switchToBotChain}
          className="text-sm px-4 py-2 rounded-lg bg-amber-900 text-white hover:bg-amber-800 transition"
        >
          Switch to BOT Chain
        </button>
      </div>
    </div>
  );
}
