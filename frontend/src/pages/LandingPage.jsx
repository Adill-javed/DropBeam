import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Zap, Shield, Smartphone, ChevronDown, HelpCircle, Laptop } from 'lucide-react';
import { createRoom } from '../utils/api';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const navigate = useNavigate();
  const { devicePair } = useParams();
  const [fromDevice, toDevice] = devicePair ? devicePair.split('-to-') : [null, null];
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  // Helper to format device labels cleanly
  const getDeviceLabel = (dev) => {
    if (!dev) return '';
    const d = dev.toLowerCase();
    if (d === 'pc' || d === 'mac' || d === 'ios') {
      return dev.toUpperCase();
    }
    return dev.charAt(0).toUpperCase() + dev.slice(1);
  };

  const fromFormatted = getDeviceLabel(fromDevice);
  const toFormatted = getDeviceLabel(toDevice);
  const isSEOPage = fromDevice && toDevice;

  // Dynamically update document headers for Search Engine crawlers (Dynamic SEO)
  useEffect(() => {
    if (isSEOPage) {
      document.title = `Transfer Files from ${fromFormatted} to ${toFormatted} Instantly | DropBeam`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          'content',
          `The fastest, secure way to transfer files, photos, and videos from ${fromFormatted} to ${toFormatted} online. No cables or apps required.`
        );
      }
    } else {
      document.title = "DropBeam - Instant & Secure File Sharing Between Devices";
    }
  }, [fromDevice, toDevice, isSEOPage, fromFormatted, toFormatted]);

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      const room = await createRoom();
      navigate(`/room/${room.id}`);
    } catch (error) {
      toast.error('Failed to create room. Please try again.');
      setLoading(false);
    }
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (joinCode.length === 6) {
      navigate(`/room/${joinCode}`);
    } else {
      toast.error('Please enter a valid 6-character room code.');
    }
  };

  // Structured SEO-focused questions for Google ranking
  const faqs = [
    {
      q: `How do I transfer files wirelessly from ${isSEOPage ? fromFormatted : 'my phone'} to ${isSEOPage ? toFormatted : 'my PC'}?`,
      a: `Simply click "Create Transfer Room" on this page. A secure DropBeam room will be created instantly. Scan the displayed QR code with your ${isSEOPage ? fromFormatted : 'mobile device'} or input the 6-character room code on your ${isSEOPage ? toFormatted : 'computer'}. You can then drop files, photos, or text, and they will sync instantly in real-time.`
    },
    {
      q: "Do I need to install an app or register an account?",
      a: "No! DropBeam is built to be entirely friction-free. You don't need to visit an App Store, install any third-party software, or provide your email address. It runs instantly within any mobile or desktop web browser."
    },
    {
      q: "Is file sharing on DropBeam secure?",
      a: "Absolutely. DropBeam establishes a secure, encrypted peer-to-peer web bridge for your devices. Transferred files are kept temporary, stored in memory, and the entire room and its files self-destruct automatically after 15 minutes of inactivity."
    },
    {
      q: "What kinds of files can I transfer?",
      a: "You can transfer any file format (photos, 4K videos, documents, PDFs, ZIP archives, and even plain text clips) up to 100MB per file absolutely free."
    }
  ];

  // Popular internal links to build a powerful crawlable sitemap architecture
  const popularPairs = [
    { from: 'iphone', to: 'pc', label: 'iPhone to PC' },
    { from: 'android', to: 'mac', label: 'Android to Mac' },
    { from: 'phone', to: 'pc', label: 'Phone to PC' },
    { from: 'pc', to: 'pc', label: 'PC to PC' },
    { from: 'android', to: 'windows', label: 'Android to Windows' },
    { from: 'iphone', to: 'mac', label: 'iPhone to Mac' }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6">
      {/* Invisible SEO text block for Googlebot crawlers */}
      <h2 className="sr-only">
        {isSEOPage 
          ? `Free online tool to transfer photos, documents, and videos from ${fromFormatted} to ${toFormatted} wirelessly.` 
          : "Instant online file transfer tool between mobile and PC without signup."}
      </h2>

      <div className="w-full flex-grow flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full text-center space-y-12"
        >
          {/* Brand Icon Header */}
          <div className="space-y-6">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-20 h-20 bg-dark-card glass rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.3)] border border-white/10"
            >
              <img 
                src="/favicon.svg" 
                alt="DropBeam Logo" 
                className={`w-12 h-12 select-none ${isSEOPage ? 'animate-pulse' : ''}`} 
              />
            </motion.div>
            
            {/* Dynamic SEO Title & Heading */}
            {isSEOPage ? (
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                Transfer from <span className="neon-text">{fromFormatted}</span> to <span className="neon-text">{toFormatted}</span>
              </h1>
            ) : (
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
                Drop<span className="neon-text">Beam</span>
              </h1>
            )}
            
            <p className="text-xl md:text-2xl text-dark-muted max-w-2xl mx-auto">
              {isSEOPage 
                ? `Instant, wireless file sharing bridge from your ${fromFormatted} to ${toFormatted}. Drop files once, access them instantly on the other end.` 
                : "Drop once. Access anywhere. The friction-free bridge between your devices."}
            </p>
          </div>

          {/* Action Area */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateRoom}
              disabled={loading}
              className="relative group overflow-hidden rounded-full bg-dark-card border border-white/20 px-8 py-4 shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center space-x-3 text-lg font-semibold">
                <FileUp className="w-6 h-6 text-dark-accent" />
                <span>{loading ? 'Initializing Bridge...' : isSEOPage ? `Pair ${fromFormatted} & ${toFormatted}` : 'Create Transfer Room'}</span>
              </span>
            </motion.button>

            <div className="text-dark-muted font-medium px-4">OR</div>

            <motion.form 
              onSubmit={handleJoinRoom}
              className="flex items-center glass-card !p-2 rounded-full overflow-hidden border border-white/10 shadow-lg"
            >
              <input 
                type="text" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter Room Code"
                maxLength={6}
                className="bg-transparent border-none focus:outline-none text-center font-bold tracking-widest w-40 px-4 placeholder:text-dark-muted/50 placeholder:tracking-normal placeholder:font-normal"
              />
              <button 
                type="submit"
                disabled={!joinCode || joinCode.length !== 6}
                className="bg-dark-accent text-dark-bg px-6 py-2.5 rounded-full font-bold hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Join
              </button>
            </motion.form>
          </div>

          {/* Three Feature Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
            {[
              { icon: Zap, title: "Instant Transfer", desc: "No login, no app installation required. Just scan and drop." },
              { icon: Shield, title: "Secure & Private", desc: "Peer-to-peer sharing. Rooms self-destruct after 15 minutes." },
              { icon: Smartphone, title: "Any System", desc: `Works seamlessly across iOS, Android, Mac, Windows, and Linux.` }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="glass-card flex flex-col items-center text-center space-y-4"
              >
                <div className="p-3 bg-dark-bg/50 rounded-xl">
                  <feature.icon className="w-6 h-6 text-dark-accent" />
                </div>
                <h3 className="font-semibold text-lg">{feature.title}</h3>
                <p className="text-sm text-dark-muted">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Collapsible SEO FAQ Accordion - Massive for Google Search Visibility */}
          <div className="pt-24 max-w-3xl mx-auto text-left space-y-6">
            <div className="flex items-center space-x-3 justify-center md:justify-start">
              <HelpCircle className="w-6 h-6 text-dark-accent" />
              <h3 className="text-2xl font-bold tracking-tight">Frequently Asked Questions</h3>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="glass-card border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-semibold text-lg hover:text-dark-accent transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-dark-muted transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-dark-accent' : ''}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="p-5 pt-0 text-dark-muted leading-relaxed text-sm md:text-base border-t border-white/5">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Pairing Links (Internal linking matrix to boost Googlebot indexing) */}
          <div className="pt-20 pb-8 space-y-4 max-w-2xl mx-auto">
            <h4 className="text-xs font-semibold text-dark-muted uppercase tracking-wider">Popular Transfers</h4>
            <div className="flex flex-wrap justify-center gap-3">
              {popularPairs.map((pair, index) => (
                <a
                  key={index}
                  href={`/transfer/${pair.from}-to-${pair.to}`}
                  className="text-xs px-3.5 py-2 rounded-full bg-dark-card/30 border border-white/5 hover:border-dark-accent/40 hover:text-dark-accent transition-all duration-300 shadow-sm"
                >
                  {pair.label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
