
import React, { useState, useRef, useEffect } from 'react';
import { executeGroundedSynth, optimizeVisualPrompt, routeSemanticAssets, suggestScoutWeights } from '../geminiService';
import { LatentParams, AgentStatus, VaultItem, ScoutData, LatentGrading, VisualAnchor } from '../types';
import AgentFeed from './AgentFeed';
import ScoutDashboard from './ScoutDashboard';

interface CreationLabProps {
  onResult: (imageUrl: string, params: LatentParams, prompt: string, links: any[], grading?: LatentGrading, visualAnchor?: VisualAnchor) => void;
  params: LatentParams;
  setParams: (p: LatentParams) => void;
  onReset: () => void;
  vault?: VaultItem[];
}

const CreationLab: React.FC<CreationLabProps> = ({ onResult, params, setParams, onReset, vault = [] }) => {
  const [prompt, setPrompt] = useState('');
  const [weights, setWeights] = useState({ X: 50, Y: 50, Z: 50 });
  const [isAutoSync, setIsAutoSync] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [logs, setLogs] = useState<AgentStatus[]>([]);
  const [recommendedNodes, setRecommendedNodes] = useState<any>(null);
  const [semanticReasoning, setSemanticReasoning] = useState('');
  const [scoutData, setScoutData] = useState<ScoutData | null>(null);
  const [groundingLinks, setGroundingLinks] = useState<any[]>([]);
  
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (prompt.length > 5) {
        if (isAutoSync) {
          try {
            const suggested = await suggestScoutWeights(prompt);
            setWeights(suggested);
          } catch (e) { console.error(e); }
        }
        if (vault.length > 0) {
          try {
            const routing = await routeSemanticAssets(prompt, vault);
            setRecommendedNodes(routing.recommendedIds);
            setSemanticReasoning(routing.priorityReasoning);
          } catch (e) { console.error(e); }
        }
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [prompt, isAutoSync, vault]);

  const handleMagicWand = async () => {
    if (!prompt.trim() || isOptimizing) return;
    setIsOptimizing(true);
    setLogs(prev => [...prev, { type: 'Meta-Prompt Translator', status: 'processing', message: 'Otimizando intenção visual v12.0...', timestamp: Date.now(), department: 'Advanced' }]);
    try {
      const optimized = await optimizeVisualPrompt(prompt);
      setPrompt(optimized);
      setLogs(prev => [...prev, { type: 'Meta-Prompt Translator', status: 'completed', message: 'Refinamento neural V12 concluído.', timestamp: Date.now(), department: 'Advanced' }]);
    } catch (e) { console.error(e); } finally { setIsOptimizing(false); }
  };

  const handleHardReset = () => {
    setPrompt('');
    setWeights({ X: 50, Y: 50, Z: 50 });
    setIsAutoSync(false);
    setScoutData(null);
    setGroundingLinks([]);
    setLogs([]);
    setRecommendedNodes(null);
    setSemanticReasoning('');
    onReset();
  };

  const handleProcess = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setScoutData(null);
    setLogs([{ type: 'Semantic Router', status: 'processing', message: `Iniciando síntese multi-camada V12.0...`, timestamp: Date.now() }]);
    
    try {
      const result = await executeGroundedSynth(prompt, weights, vault);
      if (result.imageUrl) {
        setScoutData(result.scoutData || null);
        setGroundingLinks(result.groundingLinks || []);
        onResult(result.imageUrl, result.params, prompt, result.groundingLinks || [], result.grading, result.visual_anchor);
      }
    } catch (e) { console.error(e); } finally { setIsProcessing(false); }
  };

  const updateWeight = (dim: 'X' | 'Y' | 'Z', val: number) => {
    if (isAutoSync) return;
    setWeights(prev => ({ ...prev, [dim]: val }));
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] overflow-hidden min-h-full">
      <div className="flex-1 flex flex-col lg:flex-row gap-8 p-6 lg:p-12 overflow-y-auto pb-32">
        <div className="flex-1 space-y-10 max-w-5xl">
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2">
               <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Nexus Creation Hub</h2>
               <p className="text-[10px] mono text-zinc-500 uppercase tracking-[0.5em]">LCP-v12.0 INDUSTRIAL CORE</p>
            </div>
            <button 
              onClick={handleHardReset}
              className="p-3 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl hover:bg-red-600/20 transition-all flex items-center gap-2"
              title="Reset Protocol"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2}/></svg>
              <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Reset Hub</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-8">
                <div className="bg-zinc-950 border border-white/5 p-8 rounded-[3rem] space-y-5 shadow-2xl transition-all relative group">
                   <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">Synthesis Directive</label>
                      <button 
                        onClick={handleMagicWand}
                        disabled={isOptimizing || !prompt.trim()}
                        className={`p-2 rounded-xl border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 transition-all ${isOptimizing ? 'animate-pulse' : ''}`}
                        title="Neural Optimize"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13.5 3L11 8.5L5.5 11L11 13.5L13.5 19L16 13.5L21.5 11L16 8.5L13.5 3Z" strokeWidth={2}/></svg>
                      </button>
                   </div>
                   <textarea 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Specify your visual intent (Truth Visual Sync)..."
                      className="w-full h-40 bg-black/50 border border-white/5 rounded-3xl p-6 text-[13px] text-white focus:outline-none focus:border-indigo-500/30 resize-none transition-all placeholder:text-zinc-800"
                   />
                </div>

                <div className="bg-zinc-950 border border-white/5 p-8 rounded-[3rem] space-y-6 shadow-2xl relative">
                   <div className="flex justify-between items-center px-1">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Scout Weight Matrix</label>
                      <div className="flex items-center gap-2">
                         <span className="text-[8px] font-black text-indigo-500 uppercase">Auto-Sync</span>
                         <button 
                           onClick={() => setIsAutoSync(!isAutoSync)}
                           className={`w-8 h-4 rounded-full transition-all relative ${isAutoSync ? 'bg-indigo-600' : 'bg-zinc-800'}`}
                         >
                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isAutoSync ? 'left-4.5' : 'left-0.5'}`} />
                         </button>
                      </div>
                   </div>
                   
                   <div className={`space-y-6 transition-opacity ${isAutoSync ? 'opacity-50' : 'opacity-100'}`}>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] mono font-bold text-emerald-400"><span>IDENTITY [X]</span> <span>{weights.X}%</span></div>
                         <input type="range" min="0" max="100" value={weights.X} onChange={(e) => updateWeight('X', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-emerald-500" />
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] mono font-bold text-pink-400"><span>ENVIRONMENT [Y]</span> <span>{weights.Y}%</span></div>
                         <input type="range" min="0" max="100" value={weights.Y} onChange={(e) => updateWeight('Y', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-pink-500" />
                      </div>
                      <div className="space-y-2">
                         <div className="flex justify-between text-[10px] mono font-bold text-cyan-400"><span>STYLE [Z]</span> <span>{weights.Z}%</span></div>
                         <input type="range" min="0" max="100" value={weights.Z} onChange={(e) => updateWeight('Z', parseInt(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-cyan-500" />
                      </div>
                   </div>
                   
                   {isAutoSync && (
                     <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[1px] flex items-center justify-center rounded-[3rem] pointer-events-none">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Neural Sync Active</span>
                     </div>
                   )}
                </div>

                {recommendedNodes && (
                  <div className="bg-indigo-600/5 border border-indigo-500/20 p-8 rounded-[3rem] space-y-4">
                    <div className="flex items-center gap-2">
                       <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Vault Semantic Suggestion</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 italic">"{semanticReasoning}"</p>
                  </div>
                )}
             </div>

             <div className="space-y-8 flex flex-col">
                <div className="bg-zinc-950 border border-white/5 p-8 rounded-[3rem] space-y-5 shadow-2xl flex-1 flex flex-col transition-all hover:border-indigo-500/20 overflow-hidden relative">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Anchor Reference</label>
                   <div onClick={() => fileRef.current?.click()} className="flex-1 min-h-[200px] bg-black/40 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all relative overflow-hidden group">
                     <div className="text-center space-y-3 opacity-30">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth={1}/></svg>
                        <p className="text-[9px] font-black uppercase tracking-widest">Inject Base DNA</p>
                     </div>
                     <input type="file" ref={fileRef} className="hidden" accept="image/*" />
                   </div>
                   <button 
                    onClick={handleProcess}
                    disabled={isProcessing || !prompt.trim()}
                    className="w-full py-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black uppercase tracking-[0.8em] text-[11px] shadow-2xl active:scale-95 transition-all relative overflow-hidden"
                   >
                    {isProcessing ? 'SYNAPSING...' : 'EXECUTE GROUNDED SYNTH V12'}
                   </button>
                </div>
             </div>
          </div>

          {scoutData && <ScoutDashboard scoutData={scoutData} />}
        </div>
        <div className="w-full lg:w-[400px] flex flex-col gap-6 lg:sticky lg:top-12 h-[calc(100vh-160px)]">
           <AgentFeed logs={logs} isProcessing={isProcessing} />
        </div>
      </div>
    </div>
  );
};

export default CreationLab;
