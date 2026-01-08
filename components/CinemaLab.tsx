
import React, { useState } from 'react';
import { VaultItem, ProcessResponse, AgentStatus, LatentParams } from '../types';
import { initiateVideoGeneration } from '../geminiService';

interface CinemaLabProps {
  vault: VaultItem[];
  onSave: (item: VaultItem) => Promise<void>;
  currentSourceImage: string | null;
}

const CinemaLab: React.FC<CinemaLabProps> = ({ vault, onSave, currentSourceImage }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('Awaiting Storyboard Directive...');
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [sourceKeyframe, setSourceKeyframe] = useState<string | null>(currentSourceImage);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isProcessingSave, setIsProcessingSave] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setImageResult(null);
    try {
      const result = await initiateVideoGeneration(prompt, setProgressMsg, sourceKeyframe, aspectRatio);
      setImageResult(result.imageUrl || null);
      setProgressMsg('Frame Rendered Successfully.');
    } catch (error: any) {
      console.error(error);
      alert("Synthesis Failure: " + error.message);
      setProgressMsg('Engine Stalled.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveTake = async () => {
    if (!imageResult || isProcessingSave) return;
    setIsProcessingSave(true);
    try {
      const shortIdNum = Math.floor(10000 + Math.random() * 90000);
      // Fixed: Added 'name' property to conform to VaultItem type requirements.
      const item: VaultItem = {
        id: crypto.randomUUID(),
        shortId: `CIN-${shortIdNum}`,
        name: prompt.split(' ').slice(0, 3).join('_') || 'unnamed_cinema',
        imageUrl: imageResult,
        originalImageUrl: sourceKeyframe || imageResult,
        prompt: prompt,
        agentHistory: [{ type: 'Director', status: 'completed', message: 'Take committed to vault.', timestamp: Date.now(), department: 'Direction' }],
        params: { 
          z_anatomy: 1.0, z_structure: 1.0, z_lighting: 1.0, z_texture: 1.0, 
          hz_range: 'Cinema-v3', structural_fidelity: 1.0, scale_factor: 1.0, 
          dna_type: 'VID', 
          neural_metrics: { loss_mse: 0, ssim_index: 1, tensor_vram: 4.0, iteration_count: 0, consensus_score: 1.0 } 
        },
        rating: 5,
        timestamp: Date.now(),
        usageCount: 0,
        neuralPreferenceScore: 50,
        isFavorite: false,
        vaultDomain: 'X'
      };
      await onSave(item);
      window.alert(`Saved Take ${item.shortId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessingSave(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#08080a] overflow-hidden min-h-full">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Preview Panel */}
        <div className="flex-1 bg-black flex flex-col items-center justify-center relative p-4 md:p-8 border-r border-white/5 min-h-[340px]">
           {isGenerating && (
             <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center space-y-4 md:space-y-8 p-6 md:p-12 text-center transition-all">
                <div className="relative w-20 h-20 md:w-32 md:h-32">
                    <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin" />
                </div>
                <div className="space-y-2">
                    <p className="text-indigo-400 font-black text-[10px] md:text-xs uppercase tracking-[0.3em] animate-pulse">{progressMsg}</p>
                    <p className="text-zinc-600 text-[8px] md:text-[10px] uppercase font-bold max-w-xs mx-auto leading-none">Gemini Flash Rapid Render</p>
                </div>
             </div>
           )}

           {imageResult ? (
             <div className="w-full h-full flex items-center justify-center animate-in fade-in zoom-in duration-500">
                <img src={imageResult} className="max-w-full max-h-full rounded-2xl md:rounded-3xl shadow-2xl shadow-indigo-500/10 object-contain" alt="Take" />
             </div>
           ) : sourceKeyframe ? (
             <div className="w-full h-full flex flex-col items-center justify-center space-y-4 md:space-y-6 opacity-60">
                <img src={sourceKeyframe} className="max-w-[240px] md:max-w-lg rounded-2xl grayscale border border-white/10" alt="Source" />
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center">Reference Node Buffer Active</p>
             </div>
           ) : (
             <div className="space-y-4 text-center opacity-20 group">
                <svg className="w-16 h-16 md:w-24 md:h-24 mx-auto text-zinc-600 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" strokeWidth={1}/></svg>
                <p className="text-[10px] uppercase font-black text-zinc-600 tracking-widest">Cinema Studio Idle</p>
             </div>
           )}

           {imageResult && (
             <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-2">
                <button onClick={handleSaveTake} disabled={isProcessingSave} className="px-4 py-2 bg-white text-black rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all">Save Take</button>
             </div>
           )}
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-[400px] xl:w-[460px] bg-[#0e0e11] border-l border-white/5 flex flex-col p-4 md:p-8 space-y-6 md:space-y-10">
           <div className="flex justify-between items-center">
              <div className="space-y-0.5">
                <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Cinema Lab</h3>
                <p className="text-zinc-500 text-[8px] md:text-[11px] uppercase tracking-widest font-bold">Storyboard v3.5</p>
              </div>
              <div className="md:hidden flex gap-1">
                 <div className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/30 text-[7px] text-indigo-400 font-black uppercase">Ready</div>
              </div>
           </div>

           <div className="space-y-4 md:space-y-6 bg-black/40 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/5 shadow-inner">
              <div className="space-y-3">
                <label className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Cinematic Ratio</label>
                <div className="grid grid-cols-2 gap-2 md:gap-4">
                    <button 
                      onClick={() => setAspectRatio('16:9')}
                      className={`py-3 md:py-4 rounded-xl border flex flex-col items-center gap-1.5 md:gap-2 transition-all active:scale-95 ${aspectRatio === '16:9' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <div className={`w-6 h-3 md:w-8 md:h-4 border rounded-sm ${aspectRatio === '16:9' ? 'bg-white border-white' : 'bg-zinc-800 border-zinc-700'}`} />
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none">Landscape</span>
                    </button>
                    <button 
                      onClick={() => setAspectRatio('9:16')}
                      className={`py-3 md:py-4 rounded-xl border flex flex-col items-center gap-1.5 md:gap-2 transition-all active:scale-95 ${aspectRatio === '9:16' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <div className={`w-3 h-6 md:w-4 md:h-8 border rounded-sm ${aspectRatio === '9:16' ? 'bg-white border-white' : 'bg-zinc-800 border-zinc-700'}`} />
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest leading-none">Portrait</span>
                    </button>
                </div>
              </div>
           </div>

           <div className="space-y-3">
              <label className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Identity Node</label>
              <div className="grid grid-cols-4 gap-2">
                  <button 
                    onClick={() => setSourceKeyframe(null)}
                    className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center transition-all active:scale-90 ${sourceKeyframe === null ? 'border-indigo-600 bg-indigo-600/10 text-indigo-400' : 'border-white/5 text-zinc-700 hover:border-white/10'}`}
                  >
                     <span className="text-[8px] font-black uppercase">Text Only</span>
                  </button>
                  {vault.slice(0, 3).map(v => (
                    <button 
                      key={v.id} 
                      onClick={() => setSourceKeyframe(v.imageUrl)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-90 ${sourceKeyframe === v.imageUrl ? 'border-indigo-600 shadow-lg shadow-indigo-500/20' : 'border-white/5'}`}
                    >
                       <img src={v.imageUrl} className="w-full h-full object-cover" alt="Node" />
                    </button>
                  ))}
              </div>
           </div>

           <div className="flex-1 flex flex-col space-y-4 md:space-y-6 justify-end pb-4 md:pb-0">
              <div className="space-y-2">
                <label className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase tracking-widest block px-1">Scene Directive</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Direct motion, lens, action..."
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl p-4 md:p-6 text-xs md:text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 min-h-[100px] md:min-h-[140px] resize-none transition-colors"
                />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full py-5 md:py-8 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-20 text-white rounded-2xl md:rounded-[2.5rem] font-black uppercase tracking-[0.4em] text-[10px] md:text-xs shadow-2xl active:scale-95 transition-all shadow-indigo-500/20"
              >
                {isGenerating ? 'Synthesizing...' : 'Render Frame'}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CinemaLab;
