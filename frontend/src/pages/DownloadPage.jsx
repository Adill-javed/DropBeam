import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Copy, File as FileIcon } from 'lucide-react';
import { getRoom, getDownloadUrl } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

export default function DownloadPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRoom = useCallback(async () => {
    try {
      const data = await getRoom(roomId);
      setRoom(data);
    } catch (error) {
      toast.error('Room not found or expired');
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [roomId, navigate]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  useWebSocket(roomId, (message) => {
    if (message.type === 'NEW_FILE' || message.type === 'NEW_TEXT') {
      fetchRoom();
      toast('New item received!', { icon: '🔔' });
    }
  });

  const handleDownload = (fileId, filename) => {
    const url = getDownloadUrl(roomId, fileId);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse w-16 h-16 bg-dark-accent rounded-full" /></div>;
  if (!room) return null;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Connected to <span className="neon-text">{roomId}</span></h1>
        <p className="text-dark-muted">Items shared in this room will appear below in real-time.</p>
      </div>

      <div className="space-y-4">
        {room.files.length === 0 && room.texts.length === 0 && (
          <div className="glass-card py-16 text-center text-dark-muted">
            Waiting for files or text to be shared...
          </div>
        )}

        <AnimatePresence>
          {[...room.files].reverse().map(file => (
            <motion.div 
              key={file.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card !p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <FileIcon className="w-8 h-8 text-blue-400" />
                </div>
                <div className="truncate">
                  <p className="font-semibold text-lg truncate">{file.originalFilename}</p>
                  <p className="text-sm text-dark-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button 
                onClick={() => handleDownload(file.id, file.originalFilename)}
                className="flex items-center gap-2 px-4 py-2 bg-dark-accent hover:bg-blue-400 text-dark-bg font-semibold rounded-lg transition-colors shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span className="hidden md:inline">Download</span>
              </button>
            </motion.div>
          ))}

          {[...room.texts].reverse().map(text => (
            <motion.div 
              key={text.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card flex flex-col gap-2"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-dark-muted font-medium uppercase tracking-wider">Shared Text</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(text.content);
                    toast.success('Copied to clipboard');
                  }}
                  className="flex items-center gap-1 text-sm text-dark-accent hover:text-blue-400 transition-colors"
                >
                  <Copy className="w-4 h-4" /> Copy
                </button>
              </div>
              <div className="bg-dark-bg/50 p-4 rounded-lg font-mono text-sm break-words whitespace-pre-wrap">
                {text.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
