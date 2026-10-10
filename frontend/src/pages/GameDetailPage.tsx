/**
 * Game Detail Page Component for TelePlay Ethiopia
 * Displays large original artwork, title, full description, controls, difficulty,
 * best score, coin requirements, Play button, Leaderboard button, and Back button.
 */

import React from 'react';
import { GameDefinition, UserProfile } from '../types';
import { OriginalGameArtwork } from '../components/OriginalGameArtwork';
import { 
  Play, 
  ArrowLeft, 
  Trophy, 
  Coins, 
  Star, 
  Sparkles, 
  Flame, 
  Gamepad2, 
  Puzzle, 
  Activity, 
  BookOpen, 
  Music, 
  Car, 
  Target, 
  CheckCircle2, 
  Share2, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

interface GameDetailPageProps {
  game: GameDefinition;
  profile: UserProfile;
  onBack: () => void;
  onPlay: (game: GameDefinition) => void;
  onViewLeaderboard?: (game: GameDefinition) => void;
}

export const GameDetailPage: React.FC<GameDetailPageProps> = ({
  game,
  profile,
  onBack,
  onPlay,
  onViewLeaderboard,
}) => {
  const userScore = profile.highScores[game.id] || 0;

  // Genre Icon mapping
  const getGenreIcon = (genre: string, cat: string) => {
    const key = (genre || cat || '').toLowerCase();
    if (key.includes('puzzle')) return <Puzzle className="w-4 h-4" />;
    if (key.includes('reaction')) return <Activity className="w-4 h-4" />;
    if (key.includes('knowledge') || key.includes('trivia')) return <BookOpen className="w-4 h-4" />;
    if (key.includes('music') || key.includes('rhythm')) return <Music className="w-4 h-4" />;
    if (key.includes('racing') || key.includes('speed')) return <Car className="w-4 h-4" />;
    if (key.includes('arcade') || key.includes('balloon') || key.includes('reflex')) return <Sparkles className="w-4 h-4" />;
    if (key.includes('sport') || key.includes('archery')) return <Target className="w-4 h-4" />;
    return <Gamepad2 className="w-4 h-4" />;
  };

  const getDifficultyColor = (diff: string = 'Medium') => {
    switch (diff.toLowerCase()) {
      case 'easy':
        return 'bg-[#63F5C8]/10 text-[#63F5C8] border-[#63F5C8]/30';
      case 'hard':
        return 'bg-[#FF796C]/10 text-[#FF796C] border-[#FF796C]/30';
      case 'medium':
      default:
        return 'bg-[#F7C85B]/10 text-[#F7C85B] border-[#F7C85B]/30';
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${game.title} - TelePlay Ethiopia`,
        text: `Play ${game.title} on TelePlay Ethiopia! My high score is ${userScore} points.`,
        url: window.location.href,
      }).catch(() => {});
    }
  };

  return (
    <div className="pb-24 max-w-4xl mx-auto px-3 sm:px-6 pt-2 text-[#F5FAFC] select-none">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <button
          id="detail-back-button"
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#102C40] border border-[#244558] text-[#F5FAFC] hover:border-[#35D9F2] transition-colors text-xs font-bold shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Coin Balance Container */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#15374A] border border-[#244558] text-[#F5FAFC] text-xs font-mono font-bold shadow-2xs">
            <div className="w-4 h-4 rounded-lg bg-[#F7C85B]/20 text-[#F7C85B] flex items-center justify-center shrink-0">
              <Coins className="w-2.5 h-2.5 fill-current" />
            </div>
            <span className="text-[#A9C0CE] font-sans font-semibold text-[10px]">Balance:</span>
            <span className="text-[#F7C85B] font-black">{profile.coins ?? profile.energyBalance ?? 25} Coins</span>
          </div>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-[#102C40] border border-[#244558] text-[#A9C0CE] hover:text-[#F5FAFC] hover:border-[#35D9F2] transition-colors shadow-xs cursor-pointer"
            title="Share Game"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Large Artwork & Header Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-[#102C40] border border-[#244558] shadow-sm mb-6">
        {/* Large Original Artwork Container */}
        <div className="relative w-full h-56 sm:h-72 md:h-80 overflow-hidden bg-[#0B2234]">
          <OriginalGameArtwork gameId={game.id} className="w-full h-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#102C40] via-transparent to-transparent" />
          
          {/* Badges Over Artwork */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#00BFA6] text-[#071827] text-xs font-bold uppercase tracking-wider shadow-sm">
              {getGenreIcon(game.genre, game.category)}
              <span>{game.genre || game.category}</span>
            </span>

            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border shadow-sm ${getDifficultyColor(game.difficulty)}`}>
              Difficulty: {game.difficulty || 'Medium'}
            </span>

            {game.isTrending && (
              <span className="px-2.5 py-1 rounded-lg bg-[#F7C85B] text-[#071827] text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-current" /> Hot
              </span>
            )}
          </div>
        </div>

        {/* Title, Subtitle, & Quick Stats */}
        <div className="p-5 sm:p-6 bg-[#102C40]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#F5FAFC] leading-tight">
                {game.title}
              </h1>
              <div className="text-sm font-bold text-[#35D9F2] mt-0.5">
                {game.titleAmharic}
              </div>
              <p className="text-xs sm:text-sm text-[#A9C0CE] mt-2 max-w-xl leading-relaxed">
                {game.tagline}
              </p>
            </div>

            {/* Rating & Play Stats */}
            <div className="flex items-center gap-3 bg-[#0B2234] p-2.5 rounded-xl border border-[#244558]">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#15374A] rounded-lg border border-[#244558] text-[#F7C85B]">
                <Star className="w-4 h-4 fill-current text-[#F7C85B]" />
                <span className="text-xs font-black">{game.rating}</span>
              </div>
              <div className="text-right pr-2">
                <div className="text-[10px] text-[#A9C0CE] font-semibold uppercase">Total Plays</div>
                <div className="text-xs font-mono font-bold text-[#F5FAFC]">
                  {game.playsCount.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* 1. Best Score Card */}
        <div className="p-4 rounded-xl bg-[#102C40] border border-[#244558] flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-[#A9C0CE] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-[#F7C85B]" />
              <span>Personal Best</span>
            </div>
            <div className="text-xl font-black font-mono text-[#63F5C8]">
              {userScore > 0 ? `${userScore.toLocaleString()} PTS` : 'No Record Yet'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#15374A] border border-[#244558] flex items-center justify-center text-[#F7C85B]">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Coin Requirement Card */}
        <div className="p-4 rounded-xl bg-[#102C40] border border-[#244558] flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-[#A9C0CE] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-[#F7C85B]" />
              <span>Coins Required</span>
            </div>
            <div className="text-xl font-black font-mono text-[#F5FAFC] flex items-center gap-1">
              <span className="text-[#63F5C8]">100% Free</span>
              <span className="text-xs text-[#A9C0CE] font-normal">/ match</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#15374A] border border-[#244558] flex items-center justify-center text-[#F7C85B]">
            <Coins className="w-5 h-5 fill-current" />
          </div>
        </div>

        {/* 3. Match Duration & Server */}
        <div className="p-4 rounded-xl bg-[#102C40] border border-[#244558] flex items-center justify-between shadow-xs">
          <div>
            <div className="text-[11px] text-[#A9C0CE] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#35D9F2]" />
              <span>Session Duration</span>
            </div>
            <div className="text-xl font-black font-mono text-[#F5FAFC]">
              ~60s - 90s
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#15374A] border border-[#244558] flex items-center justify-center text-[#00BFA6]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Game Description, Rules, & Controls Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* About & Features */}
        <div className="p-5 rounded-2xl bg-[#102C40] border border-[#244558] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#00BFA6] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#63F5C8]" />
              <span>Game Overview</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#A9C0CE] leading-relaxed mb-4">
              {game.description}
            </p>

            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[#F5FAFC] uppercase tracking-wider">
                How to Score:
              </div>
              <ul className="space-y-1.5">
                {game.instructions.map((inst, idx) => (
                  <li key={idx} className="text-xs text-[#A9C0CE] flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#63F5C8] shrink-0 mt-0.5" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Controls Breakdown */}
        <div className="p-5 rounded-2xl bg-[#102C40] border border-[#244558] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-[#35D9F2] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-[#35D9F2]" />
              <span>Controls & Mechanics</span>
            </h3>

            <div className="p-4 rounded-xl bg-[#0B2234] border border-[#244558] mb-4">
              <div className="text-xs font-mono font-bold text-[#F5FAFC] mb-1">
                {game.controlsDescription}
              </div>
              <div className="text-[11px] text-[#A9C0CE]">
                Optimized for ultra-responsive mobile touch screens.
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0B2234] border border-[#244558] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A9C0CE]">Primary Input:</span>
                <span className="text-[#35D9F2] font-bold">Touch Tap & Swipe</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A9C0CE]">FPS Target:</span>
                <span className="text-[#F5FAFC] font-mono font-bold">60 FPS Ultra-Smooth</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A9C0CE]">Data Usage:</span>
                <span className="text-[#63F5C8] font-bold">&lt; 150 KB per session</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Dock */}
      <div className="sticky bottom-4 z-30 p-3 sm:p-4 rounded-2xl bg-[#0B2234] border border-[#244558] text-[#F5FAFC] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-xl bg-[#15374A] border border-[#244558] flex items-center justify-center shrink-0">
            <Coins className="w-6 h-6 text-[#F7C85B] fill-current" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#F5FAFC] flex items-center gap-1.5">
              <span>Ready for match</span>
              <span className="text-[#63F5C8] font-mono font-bold">• 100% Free</span>
            </div>
            <div className="text-[11px] text-[#A9C0CE]">
              Instant launch available
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Leaderboard Button */}
          <button
            id="detail-leaderboard-button"
            onClick={() => {
              if (onViewLeaderboard) {
                onViewLeaderboard(game);
              }
            }}
            className="flex-1 sm:flex-none px-5 py-3.5 rounded-xl bg-[#15374A] hover:bg-[#244558] border border-[#244558] text-[#F5FAFC] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-[#F7C85B]" />
            <span>Leaderboard</span>
          </button>

          {/* Play Button */}
          <button
            id="detail-play-button"
            onClick={() => onPlay(game)}
            className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] text-[#071827] font-black text-sm uppercase tracking-wider active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>PLAY NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
};
