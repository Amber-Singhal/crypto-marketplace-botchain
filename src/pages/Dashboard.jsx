import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { BOT_CHAIN } from '../config';

function shorten(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Dashboard({ readContract, account, connect, isCorrectNetwork }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      if (!readContract) return;
      try {
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
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchListings();
  }, [readContract]);

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-3">Dashboard</h2>
        <p className="text-stone-600 mb-6">Connect MetaMask to see your activity.</p>
        <button onClick={connect} className="px-5 py-2.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800">
          Connect MetaMask
        </button>
      </div>
    );
  }

  const myListings = listings.filter((l) => l.seller.toLowerCase() === account.toLowerCase());
  const myPurchases = listings.filter((l) => l.sold && l.buyer.toLowerCase() === account.toLowerCase());

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <p className="text-sm text-stone-500 mb-1">Connected wallet</p>
          <p className="font-mono text-stone-900 break-all">{account}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-5">
          <p className="text-sm text-stone-500 mb-1">Network</p>
          <p className="font-medium text-stone-900">{isCorrectNetwork ? BOT_CHAIN.name : 'Wrong network'}</p>
        </div>
      </div>

      <Section title="Your listings" items={myListings} empty="You haven't listed any items yet." />
      <Section title="Your purchases" items={myPurchases} empty="You haven't bought any items yet." />
    </div>
  );
}

function Section({ title, items, empty }) {
  return (
    <div className="mb-10">
      <h2 className="text-lg font-semibold text-stone-900 mb-4">{title}</h2>
      {items.length === 0 ? (
        <p className="text-stone-500 text-sm">{empty}</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link key={item.id} to={`/listing/${item.id}`} className="block bg-white rounded-xl border border-stone-200 p-4 hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-stone-900">{item.title}</p>
                  <p className="text-sm text-stone-500">{ethers.formatEther(item.price)} {BOT_CHAIN.nativeCurrency.symbol}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${item.sold ? 'bg-stone-200 text-stone-700' : 'bg-teal-100 text-teal-800'}`}>
                  {item.sold ? 'Sold' : 'Available'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
