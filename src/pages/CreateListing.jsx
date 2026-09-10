import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { BOT_CHAIN } from '../config';
import { getHumanReadableError } from '../hooks/useWeb3';

export default function CreateListing({ account, writeContract, connect, isCorrectNetwork }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', description: '', image: '', price: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  if (!account) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-3">Connect your wallet</h2>
        <p className="text-stone-600 mb-6">You need MetaMask on BOT Chain to create a listing.</p>
        <button onClick={connect} className="px-5 py-2.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800">
          Connect MetaMask
        </button>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-3">Switch to BOT Chain</h2>
        <p className="text-stone-600 mb-6">Create listings on BOT Chain Mainnet only.</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    if (!form.title.trim() || !form.description.trim() || !form.image.trim() || !form.price) {
      setStatus({ type: 'error', message: 'Please fill in all fields.' });
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      setStatus({ type: 'error', message: 'Price must be greater than 0.' });
      return;
    }
    let tx;
    try {
      setSubmitting(true);
      setStatus({ type: 'info', message: 'Waiting for MetaMask confirmation...' });
      tx = await writeContract.createListing(
        ethers.parseEther(form.price),
        form.title.trim(),
        form.description.trim(),
        form.image.trim()
      );
      setStatus({ type: 'info', message: 'Transaction pending...' });
      await tx.wait();
      setStatus({ type: 'success', message: 'Listing created!' });
      setForm({ title: '', description: '', image: '', price: '' });
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setStatus({ type: 'error', message: getHumanReadableError(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">List an item</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="e.g. Vintage camera"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Describe your item"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Image URL</label>
          <input
            type="url"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="https://..."
            required
          />
          <p className="text-xs text-stone-500 mt-1">Paste a direct link to an image.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Price ({BOT_CHAIN.nativeCurrency.symbol})</label>
          <input
            type="number"
            step="0.000000000000000001"
            min="0"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="0.01"
            required
          />
        </div>

        {status.message && (
          <div className={`text-sm p-3 rounded-lg ${
            status.type === 'error' ? 'bg-red-50 text-red-700' :
            status.type === 'success' ? 'bg-teal-50 text-teal-800' :
            'bg-stone-100 text-stone-700'
          }`}>
            {status.message}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !writeContract}
          className="w-full py-2.5 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {submitting ? 'Confirming...' : 'List item'}
        </button>
      </form>
    </div>
  );
}
