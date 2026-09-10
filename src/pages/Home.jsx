import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { BOT_CHAIN } from '../config';

function shorten(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23e7e5e4"><rect width="400" height="300"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%2378716c">No image</text></svg>';

function isSmokeTest(listing) {
  return listing.title && listing.title.startsWith('Smoke Test');
}

export default function Home({ readContract, account, connect, isCorrectNetwork }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        setError(null);
        if (!readContract) return;
        const data = await readContract.getAllListings();
        setListings(data.map((item, id) => ({
          id,
          seller: item[0],
          price: item[1],
          title: item[2],
          description: item[3],
          image: item[4],
          sold: item[5],
          buyer: item[6],
        })));
      } catch (err) {
        setError('Could not load marketplace listings. Make sure you are connected to BOT Chain.');
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [readContract]);

  const visibleListings = useMemo(() => listings.filter((item) => !isSmokeTest(item)), [listings]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <section className="bg-stone-900 rounded-2xl px-6 py-12 text-stone-50 mb-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Sell anything. Pay with BOT.
          </h1>
          <p className="text-lg text-stone-300 mb-6">
            A simple peer-to-peer marketplace that runs entirely on BOT Chain Mainnet. No accounts, no emails — just MetaMask.
          </p>
          <div className="flex flex-wrap gap-3">
            {account ? (
              <Link
                to="/create"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 transition"
              >
                List an item
              </Link>
            ) : (
              <button
                onClick={connect}
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 transition"
              >
                Connect MetaMask
              </button>
            )}
            <Link
              to="/how-it-works"
              className="inline-flex items-center px-5 py-2.5 rounded-lg border border-stone-600 text-stone-200 hover:bg-stone-800 transition"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-stone-900">Marketplace listings</h2>
        <span className="text-sm text-stone-500">{visibleListings.length} item{visibleListings.length === 1 ? '' : 's'}</span>
      </div>

      {loading ? (
        <p className="text-stone-500">Loading listings...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : visibleListings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-stone-200">
          <p className="text-stone-600 mb-4">No items are currently listed.</p>
          {account ? (
            <Link to="/create" className="text-teal-700 font-medium hover:underline">Be the first to list an item</Link>
          ) : (
            <button onClick={connect} className="text-teal-700 font-medium hover:underline">Connect and list an item</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleListings.map((item) => {
            const price = ethers.formatEther(item.price);
            const isSeller = account && item.seller.toLowerCase() === account.toLowerCase();
            return (
              <div key={item.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition">
                <img
                  src={item.image || FALLBACK_IMAGE}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-stone-900 line-clamp-1">{item.title}</h3>
                    {item.sold ? (
                      <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-stone-200 text-stone-700">Sold</span>
                    ) : (
                      <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-teal-100 text-teal-800">Available</span>
                    )}
                  </div>
                  <p className="text-sm text-stone-600 line-clamp-2 mb-3">{item.description}</p>
                  <div className="text-sm text-stone-500 mb-4">
                    <span className="block">Seller: {shorten(item.seller)}</span>
                    <span className="block font-medium text-stone-900 mt-1">{price} {BOT_CHAIN.nativeCurrency.symbol}</span>
                  </div>
                  <Link
                    to={`/listing/${item.id}`}
                    className={`block text-center w-full py-2 rounded-lg font-medium transition ${
                      item.sold || isSeller
                        ? 'bg-stone-100 text-stone-400 cursor-not-allowed pointer-events-none'
                        : 'bg-stone-900 text-white hover:bg-stone-800'
                    }`}
                  >
                    {item.sold ? 'Sold' : isSeller ? 'Your listing' : 'Buy now'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
