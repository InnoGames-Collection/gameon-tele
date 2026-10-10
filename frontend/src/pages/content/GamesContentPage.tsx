/**
 * Games Content Page Component for TelePlus
 * 
 * Verbatim content from Document Section 1:
 * - 1.1 Candy Blast
 * - 1.2 Color Rush
 * - 1.3 World Legends
 * - 1.4 Pop Piano
 * - 1.5 Hill Climb
 * - 1.6 Pop Balloon
 * 
 * Includes Play buttons, complete How to Play steps, Skill Focus, and game-specific rules.
 */

import React, { useState } from 'react';
import { 
  Gamepad2, 
  ArrowLeft, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Clock 
} from 'lucide-react';
import { TELEPLUS_GAMES_CONTENT, GameContentDetails } from '../../data/teleplusContent';
import { GameDefinition, UserProfile } from '../../types';
import { OriginalGameArtwork } from '../../components/OriginalGameArtwork';

interface GamesContentPageProps {
  games?: GameDefinition[];
  profile?: UserProfile;
  onLaunchGame?: (game: GameDefinition) => void;
  onBack?: () => void;
  showHeader?: boolean;
}

export const GamesContentPage: React.FC<GamesContentPageProps> = ({
  games = [],
  profile,
  onLaunchGame,
  onBack,
  showHeader = true,
}) => {
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);

  const toggleExpand = (gameId: string) => {
    setExpandedGameId((prev) => (prev === gameId ? null : gameId));
  };

  const handlePlayClick = (contentGame: GameContentDetails) => {
    if (!onLaunchGame) return;
    // Match with real GameDefinition
    const matchedGame = games.find((g) => g.id === contentGame.id || g.title.toLowerCase().includes(contentGame.name.toLowerCase()));
    if (matchedGame) {
      onLaunchGame(matchedGame);
    } else if (games.length > 0) {
      onLaunchGame(games[0]);
    }
  };

  return (
    <div className="min-h-screen bg-[#071827] text-[#F5FAFC] pb-24 max-w-md md:max-w-xl lg:max-w-3xl mx-auto px-3.5 pt-3 select-none">
      {/* 1. Header with Back Button */}
      {showHeader && (
        <div className="flex items-center justify-between gap-3 bg-[#0B2234] border border-[#244558] text-[#F5FAFC] p-3.5 rounded-2xl shadow-xs mb-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                id="games-content-back-btn"
                onClick={onBack}
                className="w-8 h-8 rounded-xl bg-[#15374A] hover:bg-[#244558] flex items-center justify-center text-[#F5FAFC] border border-[#244558] transition-colors cursor-pointer shrink-0"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-[#00BFA6] shrink-0" />
              <h1 className="text-base font-black tracking-tight">GameSwiper Games</h1>
            </div>
          </div>
        </div>
      )}

      {/* 2. Game Guide Cards with Full Detail */}
      <div className="space-y-4">
        {TELEPLUS_GAMES_CONTENT.map((game) => {
          const isExpanded = expandedGameId === game.id;
          const personalBest = profile?.highScores?.[game.id] || 0;

          return (
            <div
              key={game.id}
              id={`game-content-card-${game.id}`}
              className="bg-[#102C40] rounded-2xl border border-[#244558] hover:border-[#35D9F2]/50 shadow-xs overflow-hidden transition-all"
            >
              {/* Top Banner Row */}
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shrink-0 bg-[#0B2234] border border-[#244558] shadow-xs">
                    <OriginalGameArtwork gameId={game.id} className="w-full h-full" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md bg-[#63F5C8]/20 text-[#63F5C8] border border-[#63F5C8]/30">
                        100% Free
                      </span>
                      <span className="text-[10px] text-[#A9C0CE] font-bold">
                        {game.genre}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-black text-[#F5FAFC] leading-tight truncate">
                      {game.name}
                    </h2>

                    {profile && (
                      <div className="text-[11px] font-mono font-black text-[#35D9F2]">
                        Best Score: {personalBest} PTS
                      </div>
                    )}
                  </div>
                </div>

                {onLaunchGame && (
                  <button
                    onClick={() => handlePlayClick(game)}
                    className="px-4 py-2 rounded-xl bg-[#00BFA6] hover:bg-[#63F5C8] active:scale-95 text-[#071827] font-black text-xs uppercase tracking-wider shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play</span>
                  </button>
                )}
              </div>

              {/* Overview & Quick Info */}
              <div className="px-4 pb-3 space-y-2.5">
                <div className="text-xs text-[#A9C0CE] leading-relaxed whitespace-pre-line bg-[#0B2234] p-3 rounded-xl border border-[#244558]">
                  <span className="font-bold text-[#F5FAFC] block mb-1">Overview:</span>
                  {game.overview}
                </div>

                {/* Skill Focus Pills */}
                <div>
                  <span className="text-[10px] font-bold text-[#A9C0CE] uppercase tracking-wider block mb-1">
                    Skill Focus:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {game.skillFocus.map((sf, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-[#15374A] text-[#63F5C8] text-[10px] font-bold border border-[#244558]"
                      >
                        {sf}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Accordion Toggle for How to Play & Detailed Rules */}
                <button
                  type="button"
                  onClick={() => toggleExpand(game.id)}
                  className="w-full py-2 px-3 rounded-xl bg-[#15374A] hover:bg-[#244558] text-xs font-black text-[#F5FAFC] flex items-center justify-between transition-colors cursor-pointer border border-[#244558]"
                >
                  <span>{isExpanded ? 'Hide' : 'View'} How to Play & Game Rules</span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#35D9F2]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#A9C0CE]" />
                  )}
                </button>
              </div>

              {/* Expanded Detailed Rules & How to Play */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-[#244558] bg-[#0B2234] space-y-3 animate-in fade-in">
                  {/* How to Play Steps */}
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black text-[#F5FAFC] uppercase tracking-wider">
                      How to Play:
                    </h4>
                    <ol className="list-decimal list-inside space-y-1 text-xs text-[#A9C0CE] pl-1 leading-relaxed">
                      {game.howToPlay.map((step, stepIdx) => (
                        <li key={stepIdx}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {/* Specific Game Notes */}
                  {game.gameDuration && (
                    <div className="p-3 rounded-xl bg-[#15374A] border border-[#244558] text-xs text-[#F5FAFC] space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#35D9F2]" />
                        Game Duration: {game.gameDuration}
                      </div>
                      {game.gameDurationNotes && (
                        <ul className="list-disc list-inside text-[11px] text-[#A9C0CE] pl-1 space-y-0.5">
                          {game.gameDurationNotes.map((note, nIdx) => (
                            <li key={nIdx}>{note}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {game.visualRule && (
                    <div className="p-3 rounded-xl bg-[#15374A] border border-[#244558] text-xs text-[#A9C0CE]">
                      <span className="font-bold text-[#F5FAFC]">Visual Design: </span>
                      {game.visualRule}
                    </div>
                  )}

                  {game.difficultyProgression && (
                    <div className="space-y-1.5">
                      <h5 className="text-[11px] font-black text-[#F5FAFC] uppercase">
                        Difficulty Progression:
                      </h5>
                      <div className="rounded-xl border border-[#244558] overflow-hidden bg-[#102C40] text-[11px]">
                        <div className="divide-y divide-[#244558]">
                          {game.difficultyProgression.map((dp, dpIdx) => (
                            <div key={dpIdx} className="px-3 py-1.5 flex items-center justify-between">
                              <span className="font-bold text-[#F5FAFC]">{dp.range}</span>
                              <span className="text-[#A9C0CE]">{dp.activeBalloons} • {dp.speed}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {game.balloonColors && (
                    <div className="space-y-1">
                      <h5 className="text-[11px] font-black text-[#F5FAFC] uppercase">
                        Balloon Colors:
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {game.balloonColors.map((bc, bIdx) => (
                          <div
                            key={bIdx}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#102C40] border border-[#244558] text-[10px] font-bold text-[#F5FAFC]"
                          >
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: bc.hex }}
                            />
                            <span>{bc.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
