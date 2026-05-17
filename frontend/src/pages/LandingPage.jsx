import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileUp, Zap, Shield, Smartphone } from 'lucide-react';
import { createRoom } from '../utils/api';
import toast from 'react-hot-toast';

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [joinCode, setJoinCode] = useState('');

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-12"
      >
        <div className="space-y-6">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="w-20 h-20 bg-dark-card glass rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.3)] border border-white/10"
          >
            <Zap className="w-10 h-10 text-dark-accent" />
          </motion.div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight">
            Drop<span className="neon-text">Beam</span>
          </h1>
          <p className="text-xl md:text-2xl text-dark-muted max-w-2xl mx-auto">
            Drop once. Access anywhere. <br/>
            The friction-free bridge between your devices.
          </p>
        </div>

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
              <span>{loading ? 'Initializing Bridge...' : 'Create Transfer Room'}</span>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {[
            { icon: Zap, title: "Instant Transfer", desc: "No login, no installation. Just scan and drop." },
            { icon: Shield, title: "Secure & Temporary", desc: "Rooms self-destruct after 15 minutes." },
            { icon: Smartphone, title: "Any Device", desc: "Seamlessly move data between phone and laptop." }
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
      </motion.div>
    </div>
  );
}
