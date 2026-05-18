import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import DownloadPage from './pages/DownloadPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#1E293B',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          },
        }}
      />
      <div className="min-h-screen relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-purple-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000" />

        {/* Main Content */}
        <div className="relative z-10 min-h-screen">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/transfer/:fromDevice-to-:toDevice" element={<LandingPage />} />
            <Route path="/room/:roomId" element={<DashboardPage />} />
            <Route path="/download/:roomId" element={<DownloadPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
