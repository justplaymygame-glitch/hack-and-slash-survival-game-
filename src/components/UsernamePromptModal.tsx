import React, { useState } from 'react';
import { validateUsername } from '../game/rules';
import { getRegisteredUsernames, registerNewUsername } from '../utils/storage';
import { sound } from '../audio/soundEngine';

interface UsernamePromptModalProps {
  isOpen: boolean;
  currentUsername: string;
  onSaveUsername: (name: string) => void;
  canCancel?: boolean;
  onClose?: () => void;
}

export const UsernamePromptModal: React.FC<UsernamePromptModalProps> = ({
  isOpen,
  currentUsername,
  onSaveUsername,
  canCancel = false,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState(currentUsername || '');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const existingNames = getRegisteredUsernames().filter(
      (n) => n.toLowerCase() !== currentUsername.toLowerCase()
    );

    const check = validateUsername(nameInput, existingNames);
    if (!check.valid) {
      setErrorMessage(check.error || 'Invalid warrior name.');
      sound.playHit(false);
      return;
    }

    const trimmed = nameInput.trim();
    registerNewUsername(trimmed);
    sound.playPowerUp();
    onSaveUsername(trimmed);
  };

  const handleRandomize = () => {
    const prefixes = ['Blade', 'Storm', 'Rune', 'Dusk', 'Iron', 'Sol', 'Void', 'Frost', 'Hawk', 'Wolf'];
    const suffixes = ['Fang', 'Edge', 'Sage', 'Ward', 'Fox', 'Ash', 'Star', 'Peak', 'Claw', 'Helm'];
    const randNum = Math.floor(Math.random() * 90) + 10;
    const randomName = `${prefixes[Math.floor(Math.random() * prefixes.length)]}${suffixes[Math.floor(Math.random() * suffixes.length)]}_${randNum}`;
    setNameInput(randomName);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="glass-panel w-full max-w-md rounded-3xl shadow-2xl flex flex-col overflow-hidden border-emerald-500/30 animate-fadeIn">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>🛡️ Choose Warrior Identity</span>
          </h2>
          {canCancel && onClose && (
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full glass-panel-subtle hover:bg-zinc-800 flex items-center justify-center text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Choose a unique warrior username. Friends will search this name to invite you to defense lobbies.
          </p>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-300">
                Warrior Name:
              </label>
              <button
                type="button"
                onClick={handleRandomize}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 cursor-pointer font-medium"
              >
                🎲 Randomize
              </button>
            </div>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                setErrorMessage('');
              }}
              placeholder="e.g. SylvanGuardian_99"
              autoFocus
              className="w-full bg-zinc-900 border border-zinc-700 focus:border-emerald-500 rounded-xl p-3 text-sm text-white font-bold outline-none transition-all"
            />
            {errorMessage && (
              <div className="p-2.5 bg-red-950/60 border border-red-500/60 rounded-xl text-xs text-red-200 mt-2">
                ⚠️ {errorMessage}
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500">
            • 3-16 characters · Letters, numbers, and underscores only.
            <br />• Must not be registered by another warrior.
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer font-mono shadow-md"
          >
            CONFIRM IDENTITY
          </button>
        </form>
      </div>
    </div>
  );
};
