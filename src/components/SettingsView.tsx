import React, { useRef } from 'react';
import { Download, Upload, Trash2, RotateCcw, ShieldCheck } from 'lucide-react';
import type { WatchlistEntry } from '../api/types';

interface SettingsViewProps {
  watchlistEntries: WatchlistEntry[];
  onClearWatchlist: () => void;
  onResetTaste: () => void;
  onImportWatchlist: (entries: WatchlistEntry[]) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  watchlistEntries,
  onClearWatchlist,
  onResetTaste,
  onImportWatchlist,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(watchlistEntries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `that_gal_watchlist_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportWatchlist(parsed);
          alert(`Successfully imported ${parsed.length} titles into your watchlist.`);
        } else {
          alert('Invalid format: expected JSON array of watchlist entries.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-4 border-b border-zinc-800">
        <h2 className="text-2xl font-serif font-medium text-zinc-100">Settings & Library Data</h2>
        <p className="text-xs text-zinc-400 mt-1">
          Manage local backups, privacy, and recommendation history.
        </p>
      </div>

      {/* Privacy Card */}
      <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h3 className="font-medium text-zinc-200">Local-First Privacy Architecture</h3>
          <p className="text-zinc-400 leading-relaxed">
            All your watchlist items, favorites, and learned studio and genre affinities are stored strictly on your device inside your browser's local storage. No user accounts, advertising trackers, or telemetry scripts are used.
          </p>
        </div>
      </div>

      {/* Data Backup & Portability */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-medium text-zinc-200">Backup & Portability</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleExport}
            disabled={watchlistEntries.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Watchlist (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Watchlist</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-medium text-zinc-200">Reset & Purge</h3>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between py-2 border-b border-zinc-800/60">
            <div>
              <span className="text-xs font-medium text-zinc-300 block">Clear Watchlist Library</span>
              <span className="text-[11px] text-zinc-500">Deletes all saved and completed anime titles.</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Clear all titles in your watchlist?')) {
                  onClearWatchlist();
                }
              }}
              disabled={watchlistEntries.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-800 text-xs font-medium transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Watchlist</span>
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="text-xs font-medium text-zinc-300 block">Reset Taste Profile</span>
              <span className="text-[11px] text-zinc-500">Purges all learned studio and genre weights.</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Reset all recommendation weights?')) {
                  onResetTaste();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-rose-950/40 text-zinc-400 hover:text-rose-300 border border-zinc-800 text-xs font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
