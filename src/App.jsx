import { Routes, Route, Link } from 'react-router-dom';
import { useWeb3 } from './hooks/useWeb3';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NetworkBanner from './components/NetworkBanner';
import Home from './pages/Home';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import Faq from './pages/Faq';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

export default function App() {
  const web3 = useWeb3();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar {...web3} />
      <NetworkBanner {...web3} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home {...web3} />} />
          <Route path="/create" element={<CreateListing {...web3} />} />
          <Route path="/listing/:id" element={<ListingDetail {...web3} />} />
          <Route path="/dashboard" element={<Dashboard {...web3} />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
