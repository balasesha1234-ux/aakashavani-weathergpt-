import React from 'react';
import { Clock, Zap, X, CornerDownRight, ListOrdered } from 'lucide-react';

export default function MessageQueueBar({
  queue = [],
  onRemoveMessage,
  onForcePushMessage,
  onClearQueue
}) {
  if (!queue || queue.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="glass-panel p-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-xl shadow-xl space-y-2">
        
        {/* Header */}
        <div className="flex items-center justify-between text-xs pb-1.5 border-b border-amber-500/20">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Queued Messages ({queue.length}) — Auto-dispatches when AI finishes</span>
          </div>

          <button
            type="button"
            onClick={onClearQueue}
            className="text-[11px] font-bold text-amber-400/80 hover:text-amber-200 hover:underline transition-colors"
          >
            Clear All
          </button>
        </div>

        {/* Queued Items List */}
        <div className="space-y-1.5">
          {queue.map((item, idx) => (
            <div
              key={item.id || idx}
              className="flex items-center justify-between gap-3 p-2 rounded-xl bg-black/40 border border-white/5 hover:border-amber-500/30 transition-all text-xs group"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                  #{idx + 1}
                </span>

                <div className="truncate flex-1 text-slate-200 font-medium">
                  "{item.query}"
                </div>

                {item.imageData && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 shrink-0 font-mono">
                    📷 Photo Attached
                  </span>
                )}
              </div>

              {/* Action Buttons: Force Push (Zap) & Remove (X) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onForcePushMessage(item.id)}
                  className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 transition-all shadow-sm active:scale-95"
                  title="Force Push: Send this question immediately right now"
                >
                  <Zap className="w-3 h-3 fill-slate-950" />
                  <span>Send Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveMessage(item.id)}
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                  title="Remove from queue"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
