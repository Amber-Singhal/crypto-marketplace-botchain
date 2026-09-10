import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { BOT_CHAIN } from '../config';
import { getHumanReadableError } from '../hooks/useWeb3';

const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" fill="%23e7e5e4"><rect width="600" height="400"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="20" fill="%2378716c">No image</text></svg>';

function shorten(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function ListingDetail({ readContract, writeContract, account, connect, isCorrectNetwork }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '', txHash: '' });

  useEffect(() => {
    async function fetchItem() {
      try {
        setLoading(true);
        if (!readContract) return;
        const data = await readContract.getAllListings();
        const listing = data[Number(id)];
        if (!listing) {
          setStatus({ type: 'error', message: 'This listing does not exist.' });
          setItem(null);
        } else {
          setItem({
            id: Number(id),
            seller: listing[0],
            price: listing[1],
            title: listing[2],
            description: listing[3],
            image: listing[4],
            sold: listing[5],
            buyer: listing[6],
          });
        }
      } catch (err) {
        setStatus({ type: 'error', message: 'Could not load this listing.' });
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [readContract, id]);

  const handleBuy = async () => {
    if (!account || !isCorrectNetwork) {
      setStatus({ type: 'error', message: 'Please connect MetaMask on BOT Chain to buy this item.' });
      return;
    }
    if (!item || item.sold) return;
    if (item.seller.toLowerCase() === account.toLowerCase()) {
      setStatus({ type: 'error', message: 'You cannot buy your own item.' });
      return;
    }
    setBuying(true);
    setStatus({ type: 'info', message: 'Waiting for MetaMask confirmation...' });
    try {
      const tx = await writeContract.buyListing(item.id, { value: item.price });
      setStatus({ type: 'info', message: 'Transaction pending...', txHash: tx.hash });
      await tx.wait();
      const updated = await readContract.getAllListings();
      const u = updated[item.id];
      setItem({ id: item.id, seller: u[0], price: u[1], title: u[2], description: u[3], image: u[4], sold: u[5], buyer: u[6] });
      setStatus({ type: 'success', message: 'Purchase complete!', txHash: tx.hash });
    } catch (err) {
      setStatus({ type: 'error', message: getHumanReadableError(err) });
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-16 text-stone-500">Loading...</div>;
  if (!item && status.message) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-red-600 mb-4">{status.message}</p>
      <Link to="/" className="text-teal-700 hover:underline">Back to marketplace</Link>
    </div>
  );
  if (!item) return null;

  const price = ethers.formatEther(item.price);
  const isSeller = account && item.seller.toLowerCase() === account.toLowerCase();
  const isSold = item.sold;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/" className="text-sm text-stone-500 hover:text-teal-700 mb-4 inline-block">← Back to marketplace</Link>
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <img
          src={item.image || FALLBACK_IMAGE}
          alt={item.title}
          className="w-full h-64 sm:h-80 object-cover"
          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
        />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">{item.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isSold ? 'bg-stone-200 text-stone-700' : 'bg-teal-100 text-teal-800'
            }`}>
              {isSold ? 'Sold' : 'Available'}
            </span>
          </div>
          <p className="text-stone-600 text-lg mb-6">{item.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-sm">
            <div className="bg-stone-50 rounded-lg p-4 border border-stone-100">
              <span className="block text-stone-500 mb-1">Price</span>
              <span className="text-xl font-semibold text-stone-900">{price} {BOT_CHAIN.nativeCurrency.symbol}</span>
            </div>
            <div className="bg-stone-50 rounded-lg p-4 border border-stone-100">
              <span className="block text-stone-500 mb-1">Seller</span>
              <span className="font-mono text-stone-900">{shorten(item.seller)}</span>
            </div>
            {isSold && (
              <div className="bg-stone-50 rounded-lg p-4 border border-stone-100 sm:col-span-2">
                <span className="block text-stone-500 mb-1">Buyer</span>
                <span className="font-mono text-stone-900">{shorten(item.buyer)}</span>
              </div>
            )}
          </div>

          {!account ? (
            <button onClick={connect} className="w-full py-3 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800">
              Connect MetaMask to buy
            </button>
          ) : !isCorrectNetwork ? (
            <p className="text-amber-700 bg-amber-50 rounded-lg p-4 text-sm">Please switch to BOT Chain to buy this item.</p>
          ) : isSeller ? (
            <p className="text-stone-500 bg-stone-100 rounded-lg p-4 text-sm">This is your listing.</p>
          ) : isSold ? (
            <p className="text-stone-500 bg-stone-100 rounded-lg p-4 text-sm">This item has already been sold.</p>
          ) : (
            <button
              onClick={handleBuy}
              disabled={buying}
              className="w-full py-3 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 disabled:opacity-50 transition"
            >
              {buying ? 'Confirming...' : `Buy for ${price} ${BOT_CHAIN.nativeCurrency.symbol}`}
            </button>
          )}

          {status.message && (
            <div className={`mt-4 text-sm p-4 rounded-lg ${
              status.type === 'error' ? 'bg-red-50 text-red-700' :
              status.type === 'success' ? 'bg-teal-50 text-teal-800' :
              'bg-stone-100 text-stone-700'
            }`}>
              <p>{status.message}</p>
              {status.txHash && (
                <a
                  href={`${BOT_CHAIN.explorer}/tx/${status.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-teal-700 hover:underline"
                >
                  View on BOTScan →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
