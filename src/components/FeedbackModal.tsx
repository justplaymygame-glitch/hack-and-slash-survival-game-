import React, { useState } from 'react';
import { FeedbackSubmission } from '../utils/storage';
import { sound } from '../audio/soundEngine';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  authorName: string;
  onSubmitFeedback: (feedback: FeedbackSubmission) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  authorName,
  onSubmitFeedback,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<FeedbackSubmission['category']>('gameplay');
  const [message, setMessage] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sound.playPowerUp();
    const submission: FeedbackSubmission = {
      id: 'fb_' + Date.now(),
      author: authorName || 'Anonymous Warrior',
      rating,
      category,
      message: message.trim(),
      timestamp: Date.now(),
    };

    onSubmitFeedback(submission);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 select-none">
      <div className="glass-panel w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden border-blue-500/30 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>💬 Viewer Feedback</span>
            </h2>
            <p className="text-[11px] text-slate-400">
              Share your thoughts, suggestions, or bug reports to receive +500 Gold &amp; +5 Soul Shards!
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full glass-panel-subtle hover:bg-zinc-800 flex items-center justify-center text-xs text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-3 animate-fadeIn">
              <span className="text-3xl block">🎉</span>
              <h3 className="text-sm font-bold text-emerald-400">THANK YOU WARRIOR!</h3>
              <p className="text-xs text-slate-300">
                Your feedback has been saved into the archives.
              </p>
              <div className="px-4 py-2 glass-panel-subtle text-amber-300 text-xs font-bold rounded-2xl inline-block font-mono">
                🎁 CLAIMED: +500 GOLD &amp; +5 SOUL SHARDS!
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating */}
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  Rating:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-transform hover:scale-110 cursor-pointer ${
                        rating >= star ? 'text-amber-400' : 'text-slate-600'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-xs text-amber-300 font-bold ml-2 font-mono">
                    {rating} / 5 Stars
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  Category:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-blue-500 rounded-xl p-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  <option value="gameplay">Gameplay &amp; Tower Defense Balance</option>
                  <option value="weapons">Melee Weapons (35 swords, VFX, SFX)</option>
                  <option value="enemies">Enemy Variants (65 monsters &amp; 13 Bosses)</option>
                  <option value="bosses">Character Classes &amp; Abilities</option>
                  <option value="feature">New Feature Suggestions / Rebirths</option>
                  <option value="bug">Report a Bug / Glitch</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs text-slate-300 font-bold block mb-1">
                  Message:
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  required
                  placeholder="Tell us what you love or what you'd like added..."
                  className="w-full bg-zinc-900 border border-zinc-700 focus:border-blue-500 rounded-xl p-3 text-xs text-white outline-none resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer shadow-md font-mono"
              >
                SUBMIT FEEDBACK &amp; CLAIM 500 🪙
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
