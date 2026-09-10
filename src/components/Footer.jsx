import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-stone-100 border-t border-stone-200 mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-stone-600">
          <p>&copy; {new Date().getFullYear()} Crypto MarketPlace. Built on BOT Chain.</p>
          <div className="flex gap-6">
            <Link to="/about" className="hover:text-stone-900">About</Link>
            <Link to="/how-it-works" className="hover:text-stone-900">How it Works</Link>
            <Link to="/privacy" className="hover:text-stone-900">Privacy</Link>
            <Link to="/terms" className="hover:text-stone-900">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
