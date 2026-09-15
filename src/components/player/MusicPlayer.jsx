import {
  Activity,
  Heart,
  ListMusic,
  Loader2,
  Maximize2,
  Minimize2,
  MonitorSpeaker,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { ScrollingWaveform } from "@/components/ui/waveform";

function formatSeconds(sec) {
  if (!sec || isNaN(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function MusicPlayer() {
  const { theme } = useTheme();
  const {
    currentTrack,
    isPlaying,
    isLoading,
    progress,
    currentTime,
    duration,
    volume,
    isMuted,
    shuffle,
    repeatMode,
    activeQueue,
    togglePlay,
    playNext,
    playPrevious,
    toggleLike,
    isLiked,
    seekProgress,
    handleVolumeChange,
    toggleMute,
    setShuffle,
    toggleRepeat,
    playTrack,
  } = usePlayer();

  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [useWaveformMode, setUseWaveformMode] = useState(true);

  const liked = isLiked(currentTrack.id);

  return (
    <>
      <footer
        className={`
          fixed bottom-[70px] left-2 right-2 z-50 flex h-[68px] items-center rounded-xl border px-3 shadow-2xl backdrop-blur-2xl transition-colors duration-200
          lg:static lg:h-[92px] lg:rounded-none lg:border-t lg:border-x-0 lg:border-b-0 lg:px-4 lg:shadow-none
          ${
            theme === "dark"
              ? "bg-[#181818]/95 border-white/[0.08] text-white lg:bg-black lg:border-white/[0.08]"
              : "bg-[#faf8f5]/95 border-stone-300/80 text-stone-800 lg:bg-[#faf8f5] lg:border-stone-300/70"
          }
        `}
      >
        {/* LEFT: Current Track Artwork & Meta + Favorite Heart */}
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:w-[30%] lg:flex-none">
          <motion.img
            key={currentTrack.image}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={currentTrack.image}
            alt={currentTrack.title}
            className="h-12 w-12 rounded-lg object-cover shadow-sm lg:h-[58px] lg:w-[58px]"
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-bold lg:text-[14.5px]">
              {currentTrack.title}
            </p>

            <p
              className={`
                mt-[2px] truncate text-[11.5px] lg:text-[12px]
                ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
              `}
            >
              {currentTrack.artist}{" "}
              {currentTrack.language && (
                <span className="text-red-500 font-semibold">
                  • {currentTrack.language}
                </span>
              )}
            </p>
          </div>

          {/* Favorite Heart Button (Red) */}
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => toggleLike(currentTrack)}
            className={`
              shrink-0 p-1 transition
              ${
                liked
                  ? "text-red-500"
                  : theme === "dark"
                  ? "text-[#a7a7a7] hover:text-white"
                  : "text-stone-400 hover:text-stone-900"
              }
            `}
            title={liked ? "Remove from Liked Songs" : "Save to Liked Songs"}
          >
            <Heart
              size={19}
              fill={liked ? "currentColor" : "none"}
              className={liked ? "text-red-500" : ""}
            />
          </motion.button>
        </div>

        {/* CENTER: Audio Controls & Scrubbing Progress Bar */}
        <div className="hidden min-w-0 flex-1 flex-col items-center lg:flex">
          <div className="mb-2 flex items-center gap-5">
            {/* Shuffle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShuffle((v) => !v)}
              className={`
                transition
                ${
                  shuffle
                    ? "text-red-500"
                    : theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white"
                    : "text-stone-400 hover:text-stone-900"
                }
              `}
              title={shuffle ? "Shuffle is ON" : "Shuffle is OFF"}
            >
              <Shuffle size={17} />
            </motion.button>

            {/* Previous */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              onClick={playPrevious}
              className={`
                transition
                ${
                  theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white"
                    : "text-stone-500 hover:text-stone-900"
                }
              `}
              title="Previous song"
            >
              <SkipBack size={20} fill="currentColor" />
            </motion.button>

            {/* Play/Pause Button */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.85 }}
              onClick={togglePlay}
              className={`
                flex h-10 w-10 items-center justify-center rounded-full shadow-md transition
                ${
                  theme === "dark"
                    ? "bg-white text-black hover:scale-105"
                    : "bg-stone-900 text-[#faf8f5] hover:scale-105"
                }
              `}
              title={isLoading ? "Buffering..." : isPlaying ? "Pause" : "Play"}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-current" />
              ) : isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-[2px]" />
              )}
            </motion.button>

            {/* Next */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.88 }}
              onClick={playNext}
              className={`
                transition
                ${
                  theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white"
                    : "text-stone-500 hover:text-stone-900"
                }
              `}
              title="Next song"
            >
              <SkipForward size={20} fill="currentColor" />
            </motion.button>

            {/* Repeat */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleRepeat}
              className={`
                transition
                ${
                  repeatMode !== "off"
                    ? "text-red-500"
                    : theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white"
                    : "text-stone-400 hover:text-stone-900"
                }
              `}
              title={`Repeat: ${repeatMode.toUpperCase()}`}
            >
              {repeatMode === "one" ? (
                <Repeat1 size={18} />
              ) : (
                <Repeat size={18} />
              )}
            </motion.button>
          </div>

          {/* Progress & Scrolling Waveform Seek Bar */}
          <div className="flex w-full max-w-[620px] items-center gap-3">
            <span
              className={`
              w-9 text-right text-[11px] font-medium shrink-0
              ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
            `}
            >
              {formatSeconds(currentTime)}
            </span>

            {useWaveformMode ? (
              <div className="relative flex-1 flex items-center h-7 px-1 group cursor-pointer">
                <ScrollingWaveform
                  height={26}
                  barWidth={3}
                  barGap={2}
                  speed={32}
                  fadeEdges={true}
                  isPlaying={isPlaying}
                  progress={progress}
                  interactive={true}
                  onSeek={(pct) => seekProgress(pct)}
                  activeColor="#ef4444"
                  barColor={
                    theme === "dark"
                      ? "rgba(255, 255, 255, 0.22)"
                      : "rgba(0, 0, 0, 0.18)"
                  }
                  className="w-full"
                />
              </div>
            ) : (
              <input
                aria-label="Song progress"
                type="range"
                min="0"
                max="100"
                step="0.1"
                value={progress}
                onChange={(e) => seekProgress(e.target.value)}
                className="spotify-range flex-1"
                style={{
                  "--progress": `${progress}%`,
                }}
              />
            )}

            <span
              className={`
              w-9 text-[11px] font-medium shrink-0
              ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
            `}
            >
              {currentTrack.duration}
            </span>

            {/* Toggle Waveform Mode Button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setUseWaveformMode((v) => !v)}
              className={`
                p-1 rounded-md transition cursor-pointer shrink-0
                ${
                  useWaveformMode
                    ? "text-red-500 bg-red-500/10"
                    : theme === "dark"
                    ? "text-[#888] hover:text-white"
                    : "text-stone-400 hover:text-stone-800"
                }
              `}
              title={
                useWaveformMode
                  ? "Waveform visualizer active (Click for classic slider)"
                  : "Classic slider active (Click for live waveform visualizer)"
              }
            >
              <Activity size={15} />
            </motion.button>
          </div>
        </div>

        {/* Mobile Play/Pause Button */}
        <div className="flex items-center gap-2 lg:hidden ml-auto">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={togglePlay}
            className={`
              flex h-10 w-10 items-center justify-center rounded-full shadow-md
              ${
                theme === "dark"
                  ? "bg-white text-black"
                  : "bg-stone-900 text-[#faf8f5]"
              }
            `}
          >
            {isPlaying ? (
              <Pause size={18} fill="currentColor" />
            ) : (
              <Play size={18} fill="currentColor" className="ml-[2px]" />
            )}
          </motion.button>
        </div>

        {/* RIGHT: Auxiliary Controls (Queue, Volume, Fullscreen) */}
        <div className="hidden w-[30%] items-center justify-end gap-3 lg:flex">
          {/* Queue Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowQueueModal((v) => !v)}
            className={`
              transition p-1.5 rounded-full
              ${
                showQueueModal
                  ? "text-red-500 bg-red-500/10"
                  : theme === "dark"
                  ? "text-[#a7a7a7] hover:text-white hover:bg-white/5"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
              }
            `}
            title="Current Queue"
          >
            <ListMusic size={18} />
          </motion.button>

          {/* Volume Control */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className={`
                transition
                ${
                  isMuted || volume === 0
                    ? "text-red-400"
                    : theme === "dark"
                    ? "text-[#a7a7a7] hover:text-white"
                    : "text-stone-500 hover:text-stone-900"
                }
              `}
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={18} />
              ) : volume < 50 ? (
                <Volume1 size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </motion.button>

            <input
              aria-label="Volume slider"
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : volume}
              onChange={(e) => handleVolumeChange(e.target.value)}
              className="spotify-range w-[88px]"
              style={{
                "--progress": `${isMuted ? 0 : volume}%`,
              }}
            />
          </div>

          {/* Fullscreen Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={() => setShowFullscreenModal((v) => !v)}
            className={`
              transition p-1.5 rounded-full
              ${
                theme === "dark"
                  ? "text-[#a7a7a7] hover:text-white hover:bg-white/5"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
              }
            `}
            title="Fullscreen Visualizer"
          >
            <Maximize2 size={16} />
          </motion.button>
        </div>
      </footer>

      {/* Queue Modal */}
      {showQueueModal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className={`
              fixed bottom-[104px] right-4 z-50 w-80 max-h-[420px] overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-2xl
              ${
                theme === "dark"
                  ? "bg-[#181818]/95 border-white/10 text-white"
                  : "bg-[#faf8f5]/95 border-stone-300/80 text-stone-900"
              }
            `}
          >
            <div className="flex items-center justify-between border-b p-3.5 border-stone-300/60 dark:border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-500">
                Playing Queue ({activeQueue.length})
              </h3>
              <button
                onClick={() => setShowQueueModal(false)}
                className="opacity-70 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>

            <div className="spotify-scrollbar max-h-[350px] overflow-y-auto p-2 space-y-1">
              {activeQueue.map((t, idx) => {
                const isCurrent = t.id === currentTrack.id;
                return (
                  <button
                    key={t.id + idx}
                    onClick={() => playTrack(t)}
                    className={`
                      flex w-full items-center gap-2.5 rounded-lg p-2 text-left transition
                      ${
                        isCurrent
                          ? "bg-red-500/15 text-red-500 font-bold"
                          : theme === "dark"
                          ? "hover:bg-white/5"
                          : "hover:bg-stone-100"
                      }
                    `}
                  >
                    <img
                      src={t.image}
                      alt={t.title}
                      className="h-9 w-9 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">
                        {t.title}
                      </p>
                      <p className="truncate text-[10px] text-[#a7a7a7]">
                        {t.artist}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-red-500">
                        NOW
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Fullscreen Player Modal */}
      {showFullscreenModal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-2xl text-white"
          >
            <button
              onClick={() => setShowFullscreenModal(false)}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              <Minimize2 size={20} />
            </button>

            <motion.img
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={currentTrack.image}
              alt={currentTrack.title}
              className="h-72 w-72 md:h-96 md:w-96 rounded-2xl object-cover shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 mb-8"
            />

            <h1 className="text-3xl md:text-4xl font-black text-center mb-2">
              {currentTrack.title}
            </h1>
            <p className="text-lg text-red-400 font-medium mb-6">
              {currentTrack.artist} • {currentTrack.album} (
              {currentTrack.language})
            </p>

            {/* Large Fullscreen Scrolling Waveform Visualization */}
            <div className="w-full max-w-xl mb-8 p-4 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="flex items-center justify-between mb-2.5 px-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400">
                  <span className={`h-2 w-2 rounded-full bg-red-500 ${isPlaying ? "animate-pulse" : ""}`} />
                  Real-Time Waveform
                </div>
                <span className="text-xs text-white/50">
                  {formatSeconds(currentTime)} / {formatSeconds(duration || currentTrack.seconds)}
                </span>
              </div>
              <ScrollingWaveform
                height={64}
                barWidth={3.5}
                barGap={2.5}
                speed={36}
                fadeEdges={true}
                isPlaying={isPlaying}
                progress={progress}
                interactive={true}
                onSeek={(pct) => seekProgress(pct)}
                activeColor="#ef4444"
                barColor="rgba(255, 255, 255, 0.25)"
              />
            </div>

            {/* Large Controls */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => setShuffle((v) => !v)}
                className={shuffle ? "text-red-500" : "text-white/60"}
              >
                <Shuffle size={24} />
              </button>

              <button
                onClick={playPrevious}
                className="text-white hover:scale-110"
              >
                <SkipBack size={32} fill="currentColor" />
              </button>

              <button
                onClick={togglePlay}
                className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-xl hover:bg-red-400 hover:scale-105"
              >
                {isPlaying ? (
                  <Pause size={28} fill="currentColor" />
                ) : (
                  <Play size={28} fill="currentColor" className="ml-1" />
                )}
              </button>

              <button
                onClick={playNext}
                className="text-white hover:scale-110"
              >
                <SkipForward size={32} fill="currentColor" />
              </button>

              <button
                onClick={() => toggleLike(currentTrack)}
                className={liked ? "text-red-500" : "text-white/60"}
              >
                <Heart size={26} fill={liked ? "currentColor" : "none"} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
