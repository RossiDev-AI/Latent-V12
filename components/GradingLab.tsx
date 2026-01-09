
import React, { useState, useEffect } from 'react';
import { VaultItem, LatentGrading } from '../types';

interface GradingLabProps {
  vault: VaultItem[];
  onSave: (item: VaultItem) => Promise<void>;
}

const GradingLab: React.FC<GradingLabProps> = ({ vault, onSave }) => {
  const [selectedNode, setSelectedNode] = useState<VaultItem | null>(null);
  const [grading, setGrading] = useState<LatentGrading>({
    brightness: 1,
    contrast: 1,
    saturation: 1,
    sharpness: 0.5,
    blur: 0,
    hueRotate: 0,
    sepia: 0,
    preset_name: 'MASTER_RAW',
    css_filter_string: 'none'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedNode && selectedNode.grading) {
      setGrading(selectedNode.grading);
    } else {
      setGrading({
        brightness: 1,
        contrast: 1,
        saturation: 1,
        sharpness: 0.5,
        blur: 0,
        hueRotate: 0,
        sepia: 0,
        preset_name: 'MASTER_RAW',
        css_filter_string: 'none'
      });
    }
  }, [selectedNode]);

  const updateParam = (key: keyof LatentGrading, val: any) => {
    const next = { ...grading, [key]: val };
    next.css_filter_string = `brightness(${next.brightness}) contrast(${next.contrast}) saturate(${next.saturation}) blur(${next.blur}px) sepia(${next.sepia}) hue-rotate(${next.hueRotate}deg)`;
    setGrading(next);
  };

  const applyPreset = (name: string, filter: string) => {
    // Tenta inferir valores básicos do preset para os sliders (simplificado)
    const next = { ...grading, preset_name: name, css_filter_string: filter };
    setGrading(next);
  };

  const handleCommit = async () => {
    if (!selectedNode || isSaving) return;
    setIsSaving(true);
    try {
      const updatedNode = { ...selectedNode, grading };
      await onSave(updatedNode);
      window.alert(`Grading committed to Node ${selectedNode.shortId}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const controls = [
    { key: 'brightness', label: 'Exposure', min: 0.5, max: 1.5, step: 0.01 },
    { key: 'contrast', label: 'Contrast', min: 0.5, max: 1.5, step: 0.01 },
    { key: 'saturation', label: 'Saturation', min: 0, max: 2.0, step: 0.01 },
    { key: 'blur', label: 'Atmospheric Haze', min: 0, max: 5, step: 0.1 },
    { key: 'sepia', label: 'Warmth', min: 0, max: 1, step: 0.01 },
    { key: 'hueRotate', label: 'Hue Shift', min: -180, max: 180, step: 1 },
  ];

  return (
    <div className="h-full flex flex-col bg-[#08080a] overflow-hidden min-h-full">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Preview Area */}
        <div className="flex-1 bg-black flex flex-col items-center justify-center relative p-4 md:p-12 border-r border-white/5 overflow-hidden">
          {!selectedNode ? (
            <div className="text-center space-y-4 opacity-20">
               <svg className="w-20 h-20 mx-auto text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485" strokeWidth={1}/></svg>
               <p className="text-[10px] uppercase font-black tracking-[0.5em] text-zinc-400">Awaiting Node Injection</p>
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-700">
               <div className="relative group max-w-full max-h-full">
                  <img 
                    src={selectedNode.imageUrl} 
                    className="max-w-full max-h-[80vh] rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-300" 
                    style={{ filter: grading.css_filter_string }}
                    alt="Master Preview" 
                  />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{selectedNode.shortId} | {grading.preset_name}</span>
                  </div>
               </div>
               
               <div className="mt-8 flex gap-4">
                  <button onClick={handleCommit} disabled={isSaving} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                    {isSaving ? 'COMMITING...' : 'Commit Master Grading'}
                  </button>
                  <button onClick={() => updateParam('brightness', 1)} className="px-8 py-3 bg-zinc-900 border border-white/5 text-zinc-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
                    Reset RAW
                  </button>
               </div>
            </div>
          )}
        </div>

        {/* Controls Area */}
        <div className="w-full lg:w-[420px] bg-[#0e0e11] border-l border-white/5 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-10">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">LGN_ENGINE_V12.1</h3>
              <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest">Optical Post-Production Suite</p>
            </div>

            {/* Presets */}
            <div className="space-y-4">
               <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">LUT Presets</label>
               <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => applyPreset('Cinema_Noir', 'grayscale(1) contrast(1.4) brightness(0.9)')}
                    className="py-3 bg-zinc-900 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:border-indigo-500/40 transition-all"
                  >
                    Cinema Noir
                  </button>
                  <button 
                    onClick={() => applyPreset('Teal_Orange', 'hue-rotate(-20deg) saturate(1.5) contrast(1.1)')}
                    className="py-3 bg-zinc-900 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:border-indigo-500/40 transition-all"
                  >
                    Teal & Orange
                  </button>
                  <button 
                    onClick={() => applyPreset('Cyber_Neon', 'saturate(2.2) brightness(1.1) contrast(1.2) hue-rotate(10deg)')}
                    className="py-3 bg-zinc-900 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:border-indigo-500/40 transition-all"
                  >
                    Cyber Neon
                  </button>
                  <button 
                    onClick={() => applyPreset('Golden_Hour', 'sepia(0.4) saturate(1.3) contrast(1.05) brightness(1.05)')}
                    className="py-3 bg-zinc-900 border border-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest hover:border-indigo-500/40 transition-all"
                  >
                    Golden Hour
                  </button>
               </div>
            </div>

            {/* Sliders */}
            <div className="space-y-6">
               <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Fine-Tune Mastering</label>
               {controls.map((ctrl) => (
                  <div key={ctrl.key} className="space-y-2.5">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{ctrl.label}</span>
                      <span className="text-[10px] mono text-indigo-400 font-bold">{(grading as any)[ctrl.key]}</span>
                    </div>
                    <input 
                      type="range" 
                      min={ctrl.min} 
                      max={ctrl.max} 
                      step={ctrl.step} 
                      value={(grading as any)[ctrl.key]} 
                      onChange={(e) => updateParam(ctrl.key as any, parseFloat(e.target.value))}
                      className="w-full h-1 bg-zinc-800 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                    />
                  </div>
               ))}
            </div>

            {/* Node Selector (Mini Vault) */}
            <div className="space-y-4 pt-10 border-t border-white/5">
               <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-1">Inject Node from Vault</label>
               <div className="grid grid-cols-4 gap-2">
                  {vault.slice(0, 12).map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => setSelectedNode(item)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all active:scale-95 ${selectedNode?.id === item.id ? 'border-indigo-600 shadow-lg' : 'border-white/5 hover:border-white/20'}`}
                    >
                       <img src={item.imageUrl} className="w-full h-full object-cover" />
                    </button>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradingLab;
