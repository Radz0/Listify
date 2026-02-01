
import React, { useState, useRef } from 'react';
import { AppStatus, GenerationResult } from './types';
import { generateProductImage } from './geminiService';
import { 
  CameraIcon, 
  PhotoIcon, 
  ArrowPathIcon, 
  ArrowDownTrayIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<GenerationResult | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setOriginalPreview(base64);
        setMimeType(file.type);
        setStatus(AppStatus.IDLE);
        setCurrentResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalPreview) return;

    setStatus(AppStatus.GENERATING);
    setError(null);

    try {
      const generatedImage = await generateProductImage(originalPreview, mimeType);
      
      setCurrentResult({
        originalImage: originalPreview,
        generatedImage: generatedImage,
        timestamp: Date.now()
      });
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during generation.");
      setStatus(AppStatus.ERROR);
    }
  };

  const downloadImage = () => {
    if (!currentResult) return;
    const link = document.createElement('a');
    link.href = currentResult.generatedImage;
    link.download = `studio-pro-${currentResult.timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setOriginalPreview(null);
    setCurrentResult(null);
    setStatus(AppStatus.IDLE);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-violet-500/40">

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Hero Section */}
        <div className="mb-16 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
            <SparklesIcon className="w-3.5 h-3.5" />
            Now Powered by Gemini 2.5
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Professional Studio Shots <br className="hidden sm:block" /> 
            <span className="text-zinc-500">From Any Casual Photo.</span>
          </h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto font-medium">
            Meet listify the first AI engine that recreates studio-grade lighting, depth, and isolation for Amazon, Shopify, and social commerce.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Input Side */}
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-3xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-50"></div>
              
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                  <PhotoIcon className="w-4 h-4" /> 01. Source Material
                </h3>
              </div>
              
              {!originalPreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center p-12 bg-zinc-900/40 hover:bg-zinc-900/80 hover:border-violet-500/40 cursor-pointer transition-all group/upload"
                >
                  <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 group-hover/upload:scale-105 group-hover/upload:bg-zinc-700/80 transition-all mb-6">
                    <CameraIcon className="w-10 h-10 text-violet-400" />
                  </div>
                  <p className="text-zinc-200 text-lg font-bold">Upload Product</p>
                  <p className="text-zinc-500 text-sm mt-2 text-center max-w-[200px]">Drag & drop or click to browse files (JPG, PNG)</p>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="relative group/preview overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-inner">
                  <img 
                    src={originalPreview} 
                    alt="Product Preview" 
                    className="w-full aspect-square object-contain"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-end justify-center pb-6">
                    <button 
                      onClick={reset}
                      className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/20 transition-all"
                    >
                      <ArrowPathIcon className="w-4 h-4" /> Replace Image
                    </button>
                  </div>
                </div>
              )}

              {originalPreview && (
                <div className="mt-8">
                  <button
                    disabled={status === AppStatus.GENERATING}
                    onClick={handleGenerate}
                    className={`group w-full py-5 px-8 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                      status === AppStatus.GENERATING 
                        ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-violet-900/40 hover:-translate-y-0.5 active:translate-y-0'
                    }`}
                  >
                    {status === AppStatus.GENERATING ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        Generating Studio Shot...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-5 h-5 transition-transform group-hover:rotate-12" />
                        Recreate in Studio
                        <ChevronRightIcon className="w-4 h-4 ml-1 opacity-50" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-500/5 border border-red-500/20 p-5 rounded-2xl flex gap-4 text-red-400">
                <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="font-black text-xs uppercase tracking-wider mb-1">System Error</p>
                  <p className="text-sm font-medium opacity-80">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Result Side */}
          <div className="space-y-6">
            <div className="glass-card p-8 rounded-3xl shadow-2xl relative min-h-[500px] flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-6 flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4" /> 02. Studio Output
              </h3>
              
              {!currentResult ? (
                <div className="flex-grow aspect-square bg-zinc-900/20 border border-zinc-800/50 rounded-2xl flex flex-col items-center justify-center p-12 text-center border-dashed">
                  {status === AppStatus.GENERATING ? (
                    <div className="space-y-8 flex flex-col items-center">
                      <div className="relative">
                        <div className="w-24 h-24 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin"></div>
                        <SparklesIcon className="w-8 h-8 text-violet-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-zinc-100 font-extrabold text-xl tracking-tight">Crafting Your Shot</p>
                        <p className="text-zinc-500 text-sm font-medium">Isolating product & perfecting lighting...</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto">
                        <PhotoIcon className="w-8 h-8 text-zinc-700" />
                      </div>
                      <p className="text-zinc-500 text-sm font-semibold">Your pro-listing ready image <br/> will appear here.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-grow space-y-8 animate-in fade-in zoom-in-95 duration-1000">
                  <div className="relative bg-white group border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(139,92,246,0.2)]">
                    <img 
                      src={currentResult.generatedImage} 
                      alt="Generated Studio Result" 
                      className="w-full aspect-square object-contain"
                    />
                    <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Optimized Result</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={downloadImage}
                      className="flex-1 bg-zinc-100 text-zinc-950 py-5 px-8 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white transition-all hover:shadow-xl active:scale-95"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                      Download Image
                    </button>
                    <button
                      onClick={handleGenerate}
                      className="bg-zinc-800 border border-zinc-700 text-zinc-200 py-5 px-8 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-700 transition-all active:scale-95"
                    >
                      <ArrowPathIcon className="w-5 h-5" />
                      Retry
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Background', value: 'Pure White (FDFDFD)', icon: '✨' },
                      { label: 'Lighting', value: 'Softbox / Diffused', icon: '💡' },
                      { label: 'Shadows', value: 'Subtle Ground Plane', icon: '🌑' },
                      { label: 'Format', value: 'Lossless PNG', icon: '📦' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 group/item hover:border-violet-500/30 transition-colors">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm grayscale group-hover/item:grayscale-0 transition-all">{item.icon}</span>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</p>
                        </div>
                        <p className="text-xs font-bold text-zinc-300">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-12 border-t border-zinc-800/50 bg-zinc-950/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-zinc-800 p-1.5 rounded-lg">
                  <SparklesIcon className="w-4 h-4 text-violet-500" />
                </div>
                <span className="font-black text-white tracking-tight uppercase text-sm">Listify</span>
              </div>
              <p className="text-zinc-500 text-xs font-medium max-w-xs text-center md:text-left leading-relaxed">
                Empowering e-commerce brands with next-gen automated product photography since 2024.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {['Shopify', 'Amazon', 'E-Commerce', 'Social Commerce'].map((platform) => (
                <div key={platform} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-800"></div>
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{platform} Optimized</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
              © 2026 R! Studios. All Rights Reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-zinc-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"></a>
              <a href="#" className="text-zinc-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"></a>
              <a href="#" className="text-zinc-600 hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
