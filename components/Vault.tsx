
import React, { useRef, useState } from 'react';
import { VaultItem, VaultDomain } from '../types';
import { toggleFavoriteNode, bulkSaveNodes } from '../dbService';

interface VaultProps {
  items: VaultItem[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onReload: (item: VaultItem) => void;
  onRefresh: () => Promise<void>;
}

const Vault: React.FC<VaultProps> = ({ items, onDelete, onClearAll, onReload, onRefresh }) => {
  const importFileRef = useRef<HTMLInputElement>(null);
  const [filterDomain, setFilterDomain] = useState<VaultDomain | 'ALL'>('ALL');

  const handleToggleFavorite = async (id: string) => {
    await toggleFavoriteNode(id);
    await onRefresh();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(items, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `latent-vault-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const importedItems = JSON.parse(ev.target?.result as string) as VaultItem[];
          if (Array.isArray(importedItems)) {
            await bulkSaveNodes(importedItems);
            await onRefresh();
            alert(`${importedItems.length} nodes successfully merged.`);
          }
        } catch (err) {
          alert('Failed to parse vault file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getDNAColor = (domain?: VaultDomain) => {
    switch(domain) {
      case 'X': return 'bg-emerald-600 border-emerald-400';
      case 'Y': return 'bg-pink-600 border-pink-400';
      case 'Z': return 'bg-cyan-600 border-cyan-400';
      case 'L': return 'bg-amber-600 border-amber-400';
      default: return 'bg-zinc-700 border-white/10';
    }
  };

  const filteredItems = items
    .filter(item => filterDomain === 'ALL' || item.vaultDomain === filterDomain)
    .sort((a, b) => {
      if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
      return b.neuralPreferenceScore - a.neuralPreferenceScore;
    });

  return (
    <div className="p-8 md:p-12 bg-[#0c0c0e] min-h-full space-y-12 pb-32">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-white/5 pb-12 gap-8">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter">Vault Repository</h2>
            <p className="text-[10px] md:text-[11px] mono text-zinc-500 uppercase tracking-[0.4em]">V11.11 Multi-Domain Logic: {items.length} Nodes</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex gap-2 bg-zinc-900/50 p-1.5 rounded-2xl border border-white/5">
                {['ALL', 'X', 'Y', 'Z', 'L'].map(d => (
                  <button 
                    key={d} 
                    onClick={() => setFilterDomain(d as any)}
                    className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterDomain === d ? 'bg-indigo-600 text-white shadow-lg' : 'text-zinc-600 hover:text-zinc-400'}`}
                  >
                    Vault {d}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                  <button onClick={handleExport} className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth={2.5}/></svg>
                     Export
                  </button>
                  <button onClick={() => importFileRef.current?.click()} className="px-5 py-2.5 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600/20 transition-all flex items-center gap-2">
                     <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" strokeWidth={2.5}/></svg>
                     Import
                  </button>
                  <input type="file" ref={importFileRef} className="hidden" accept=".json" onChange={handleImport} />
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
        {filteredItems.map((item) => (
          <div key={item.id} className={`group bg-zinc-900/20 border rounded-[3rem] overflow-hidden flex flex-col transition-all duration-700 shadow-2xl relative ${item.isFavorite ? 'border-amber-500/50 ring-2 ring-amber-500/10' : 'border-white/5 hover:border-indigo-500/40'}`}>
            <div className="relative aspect-square overflow-hidden bg-black">
              <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" alt="Node" />
              
              <button 
                onClick={() => handleToggleFavorite(item.id)}
                className={`absolute top-5 right-5 z-30 p-2.5 rounded-full backdrop-blur-md transition-all ${item.isFavorite ? 'bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110' : 'bg-black/40 text-white/50 hover:text-white'}`}
              >
                <svg className="w-4 h-4" fill={item.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.364-1.364a4.5 4.5 0 00-6.364 0z" strokeWidth={2.5}/></svg>
              </button>

              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 p-8">
                <button onClick={() => onReload(item)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95">Reload Buffer</button>
                <button onClick={() => onDelete(item.id)} className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/10 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Purge Node</button>
              </div>
              
              <div className="absolute top-5 left-5 flex flex-col gap-2 z-10">
                 <div className="flex flex-col">
                    <span className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-t-lg text-[12px] mono font-black text-white border-x border-t border-white/10">
                        {item.shortId}
                    </span>
                    <span className={`px-3 py-1 rounded-b-lg text-[10px] mono font-black shadow-xl border-x border-b text-white ${getDNAColor(item.vaultDomain)}`}>
                        VAULT {item.vaultDomain}
                    </span>
                 </div>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex justify-between items-center">
                 <div className="flex flex-col">
                    <span className="text-[8px] mono text-zinc-600 font-black uppercase">Neural Rank</span>
                    <div className="flex items-center gap-1.5 mt-1">
                       <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${item.isFavorite ? 'bg-amber-500' : 'bg-indigo-500'}`} style={{ width: `${item.neuralPreferenceScore}%` }} />
                       </div>
                       <span className={`text-[10px] mono font-bold ${item.isFavorite ? 'text-amber-400' : 'text-indigo-400'}`}>{item.neuralPreferenceScore}</span>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="text-[8px] mono text-zinc-600 font-black uppercase">Uses</span>
                    <p className="text-[10px] mono text-zinc-400 font-bold">{item.usageCount}</p>
                 </div>
              </div>
              <div className="min-h-[40px] pt-2 border-t border-white/5">
                 <p className="text-[11px] text-zinc-400 line-clamp-2 italic leading-relaxed">"{item.prompt}"</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Vault;
