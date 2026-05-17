import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Upload, File as FileIcon, Smartphone, Link, Check, Send, Download, Trash2, Clock } from 'lucide-react';
import { getRoom, uploadFile, shareText, getDownloadUrl, getPreviewUrl, deleteFile, deleteText } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(null);

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

  useEffect(() => {
    if (!room || !room.expiresAtMillis) return;

    const calculateTimeLeft = () => {
      const diff = Math.max(0, Math.floor((room.expiresAtMillis - Date.now()) / 1000));
      setTimeLeftSeconds(diff);
      
      if (diff <= 0) {
        toast.error('This room has expired and is now closed');
        navigate('/');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [room?.expiresAtMillis, navigate]);

  const formatTimeLeft = (seconds) => {
    if (seconds === null || seconds === undefined) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWebSocketMessage = useCallback((message) => {
    if (['NEW_FILE', 'NEW_TEXT', 'FILE_DELETED', 'TEXT_DELETED'].includes(message.type)) {
      fetchRoom();
    }
  }, [fetchRoom]);

  useWebSocket(roomId, handleWebSocketMessage);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (fileId, filename) => {
    const url = getDownloadUrl(roomId, fileId);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await deleteFile(roomId, fileId);
      toast.success('File deleted');
      fetchRoom();
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const handleDeleteText = async (textId) => {
    try {
      await deleteText(roomId, textId);
      toast.success('Text deleted');
      fetchRoom();
    } catch (error) {
      toast.error('Failed to delete text');
    }
  };

  const onFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size must be less than 100MB');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      await uploadFile(roomId, file, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      toast.success('File uploaded instantly');
      fetchRoom();
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const onTextShare = async (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    
    try {
      await shareText(roomId, textInput);
      setTextInput('');
      toast.success('Text shared');
      fetchRoom();
    } catch (error) {
      toast.error('Failed to share text');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse w-16 h-16 bg-dark-accent rounded-full" /></div>;
  if (!room) return null;

  const downloadUrl = `${window.location.origin}/room/${roomId}`;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Left Column: QR & Info */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="md:w-1/3 space-y-6"
      >
        <div className="glass-card flex flex-col items-center text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-400 to-emerald-400" />
          
          <h2 className="text-2xl font-bold tracking-tight">Room: <span className="neon-text">{roomId}</span></h2>
          
          {/* Live Countdown Timer */}
          <div className="w-full py-3 px-4 rounded-xl bg-dark-bg/40 border border-white/5 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-dark-muted">
              <Clock className={`w-4 h-4 ${timeLeftSeconds !== null && timeLeftSeconds <= 180 ? 'text-red-400 animate-pulse' : 'text-dark-accent'}`} />
              <span>Room Destroys In</span>
            </div>
            
            <div className={`text-3xl font-mono font-bold tracking-wider ${timeLeftSeconds !== null && timeLeftSeconds <= 180 ? 'text-red-400 animate-pulse drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]' : 'text-dark-accent drop-shadow-[0_0_10px_rgba(56,189,248,0.2)]'}`}>
              {formatTimeLeft(timeLeftSeconds)}
            </div>

            {/* Premium Countdown Progress Bar */}
            <div className="w-full bg-dark-bg/60 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r transition-all duration-1000 ${
                  timeLeftSeconds !== null && timeLeftSeconds <= 180 
                    ? 'from-orange-500 to-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse' 
                    : 'from-blue-400 to-emerald-400'
                }`}
                style={{ width: `${timeLeftSeconds !== null ? (timeLeftSeconds / (15 * 60)) * 100 : 100}%` }}
              />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-lg">
            <QRCodeSVG value={downloadUrl} size={200} />
          </div>
          
          <p className="text-sm text-dark-muted flex items-center justify-center gap-2">
            <Smartphone className="w-4 h-4" /> Scan to connect phone
          </p>

          <button 
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-dark-bg/50 rounded-lg hover:bg-dark-bg transition-colors border border-white/5"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Link className="w-5 h-5 text-dark-muted" />}
            <span>{copied ? 'Copied!' : 'Copy Share Link'}</span>
          </button>
        </div>
      </motion.div>

      {/* Right Column: Uploads & Content */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="md:w-2/3 space-y-6"
      >
        {/* Upload Area */}
        <div className="glass-card border-dashed border-2 border-white/20 hover:border-dark-accent/50 transition-colors relative">
          <input 
            type="file" 
            onChange={onFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="p-4 bg-dark-bg/50 rounded-full">
              <Upload className="w-8 h-8 text-dark-accent" />
            </div>
            <div className="text-center">
              <p className="text-lg font-medium">Drag & drop files here</p>
              <p className="text-sm text-dark-muted mt-1">or click to browse (Max 100MB)</p>
            </div>
          </div>
          {isUploading && (
            <div className="absolute bottom-0 left-0 h-1 bg-dark-accent transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
          )}
        </div>

        {/* Text Share */}
        <div className="glass-card p-4">
          <form onSubmit={onTextShare} className="flex gap-2">
            <input 
              type="text" 
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste text or snippet to share..."
              className="flex-1 bg-dark-bg/50 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-dark-accent transition-colors"
            />
            <button type="submit" className="bg-dark-accent hover:bg-blue-400 text-dark-bg p-3 rounded-lg font-semibold transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Shared Content */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold border-b border-white/10 pb-2">Shared in Room</h3>
          
          {room.files.length === 0 && room.texts.length === 0 && (
            <p className="text-dark-muted text-center py-8">No items shared yet.</p>
          )}

          <AnimatePresence>
            {[...room.files].reverse().map(file => (
              <motion.div 
                key={file.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card !p-4 flex flex-col gap-3"
              >
                {file.contentType?.startsWith('image/') && (
                  <div className="w-full max-h-64 rounded-lg overflow-hidden bg-dark-bg/50 flex items-center justify-center">
                    <img src={getPreviewUrl(roomId, file.id)} alt={file.originalFilename} className="max-w-full max-h-64 object-contain" />
                  </div>
                )}
                {file.contentType?.startsWith('video/') && (
                  <div className="w-full max-h-64 rounded-lg overflow-hidden bg-dark-bg/50 flex items-center justify-center">
                    <video src={getPreviewUrl(roomId, file.id)} controls className="max-w-full max-h-64 object-contain" />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <FileIcon className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="truncate">
                      <p className="font-medium truncate">{file.originalFilename}</p>
                      <p className="text-xs text-dark-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDownload(file.id, file.originalFilename)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-dark-bg hover:bg-dark-accent hover:text-dark-bg text-dark-text text-sm font-semibold rounded-lg transition-colors border border-white/10"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden md:inline">Download</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteFile(file.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-dark-bg hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-lg transition-colors border border-white/10 hover:border-red-500/30"
                      title="Delete File"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {[...room.texts].reverse().map(text => (
              <motion.div 
                key={text.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card !p-4"
              >
                <div className="bg-dark-bg/50 p-3 rounded-lg font-mono text-sm break-words relative group">
                  {text.content}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(text.content);
                        toast.success('Copied to clipboard');
                      }}
                      className="p-1.5 bg-dark-card rounded hover:bg-dark-accent/20"
                      title="Copy text"
                    >
                      <Copy className="w-4 h-4 text-dark-muted hover:text-dark-text transition-colors" />
                    </button>
                    <button 
                      onClick={() => handleDeleteText(text.id)}
                      className="p-1.5 bg-dark-card rounded hover:bg-red-500/20"
                      title="Delete text"
                    >
                      <Trash2 className="w-4 h-4 text-red-400/70 hover:text-red-400 transition-colors" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
