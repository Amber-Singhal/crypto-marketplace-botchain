import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BOT_CHAIN } from '../config';

function shorten(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function Navbar({ account, connect, disconnect, isCorrectNetwork }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl font-bold tracking-tight text-stone-900">
            Crypto MarketPlace
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
            <Link to="/" className="hover:text-teal-700 transition">Marketplace</Link>
            <Link to="/create" className="hover:text-teal-700 transition">Sell</Link>
            <Link to="/dashboard" className="hover:text-teal-700 transition">Dashboard</Link>
            <Link to="/about" className="hover:text-teal-700 transition">About</Link>
            <Link to="/faq" className="hover:text-teal-700 transition">FAQ</Link>
          </div>

          <div className="hidden md:flex items-center gap-3">
            {account ? (
              <>
                <span className={`text-xs px-2 py-1 rounded-full ${isCorrectNetwork ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'}`}>
                  {isCorrectNetwork ? BOT_CHAIN.nativeCurrency.symbol : 'Wrong network'}
                </span>
                <span className="text-sm font-medium text-stone-700">{shorten(account)}</span>
                <button
                  onClick={disconnect}
                  className="text-sm px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 transition"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={connect}
                className="text-sm px-4 py-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition"
              >
                Connect MetaMask
              </button>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-md text-stone-600 hover:bg-stone-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2">
          <Link to="/" className="block py-2 text-stone-700 hover:text-teal-700" onClick={() => setOpen(false)}>Marketplace</Link>
          <Link to="/create" className="block py-2 text-stone-700 hover:text-teal-700" onClick={() => setOpen(false)}>Sell</Link>
          <Link to="/dashboard" className="block py-2 text-stone-700 hover:text-teal-700" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/about" className="block py-2 text-stone-700 hover:text-teal-700" onClick={() => setOpen(false)}>About</Link>
          <Link to="/faq" className="block py-2 text-stone-700 hover:text-teal-700" onClick={() => setOpen(false)}>FAQ</Link>
          {account ? (
            <button onClick={() => { disconnect(); setOpen(false); }} className="block w-full text-left py-2 text-stone-700">Disconnect</button>
          ) : (
            <button onClick={() => { connect(); setOpen(false); }} className="block w-full text-left py-2 text-teal-700 font-medium">Connect MetaMask</button>
          )}
        </div>
      )}
    </nav>
  );
}
