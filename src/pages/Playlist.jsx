import { ArrowLeft, Heart, MoreHorizontal, Play, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import TrackRow, { TrackHeader } from "@/components/music/TrackRow";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { playlists, songs } from "@/data/musicData";

export default function Playlist() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { allPlaylists, playTrack } = usePlayer();

  const [isLikedPlaylist, setIsLikedPlaylist] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const playlist = useMemo(() => {
    const found = allPlaylists.find((item) => item.id === id);
    if (found) return found;

    const staticFound = playlists.find((item) => item.id === id);
    if (staticFound) return staticFound;

    const cleanTitle = id
      ? id
          .replace(/^live-/, "")
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : "Custom Mix";

    return {
      id: id || "playlist-mix",
      title: `${cleanTitle} Mix`,
      description: "Curated playlist mix with top tracks.",
      owner: "Spotify Live",
      followers: "Curated for you",
      image:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85",
      tracks: songs.slice(0, 8),
    };
  }, [allPlaylists, id]);

  const handlePlayAll = () => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2500);
  };

  return (
    <main
      className={`
        spotify-page transition-colors duration-200
        ${
          theme === "dark"
            ? "bg-[#121212] text-white"
            : "bg-[#f5f2eb] text-stone-900"
        }
      `}
    >
      {/* Hero Banner with Dynamic Gradient */}
      <div className="relative min-h-[210px] sm:min-h-[235px] overflow-hidden">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/90 hover:scale-105 shadow-md"
          title="Back to previous page"
        >
          <ArrowLeft size={16} />
        </button>

        <div
          className={`
            absolute inset-0 bg-gradient-to-b transition-colors duration-300
            ${
              id === "liked"
                ? "from-rose-800/60 via-red-950/30 to-transparent"
                : theme === "dark"
                ? "from-red-950/50 via-[#181818]/60 to-transparent"
                : "from-stone-300/60 via-[#f5f2eb]/70 to-transparent"
            }
          `}
        />

        <div className="relative z-10 flex flex-col gap-3.5 px-5 pb-4 pt-9 md:flex-row md:items-end">
          <motion.img
            initial={{
              opacity: 0,
              scale: 0.9,
              rotate: -2,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              type: "spring",
              stiffness: 170,
              damping: 19,
            }}
            src={playlist.image}
            alt={playlist.title}
            className="h-[125px] w-[125px] rounded-xl object-cover shadow-[0_12px_32px_rgba(0,0,0,0.35)] md:h-[150px] md:w-[150px]"
          />

          <div className="min-w-0">
            <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-red-500">
              Playlist {playlist.language ? `• ${playlist.language}` : ""}
            </p>

            <h1 className="text-2xl font-black tracking-tight sm:text-3xl xl:text-4xl leading-tight">
              {playlist.title}
            </h1>

            <p
              className={`
              mt-1 max-w-2xl text-[12.5px] line-clamp-2
              ${theme === "dark" ? "text-[#b3b3b3]" : "text-stone-600"}
            `}
            >
              {playlist.description}
            </p>

            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11.5px] font-semibold">
              <span>{playlist.owner}</span>
              <span className="opacity-40">•</span>
              <span className="text-red-500 font-bold">
                {playlist.tracks.length} songs
              </span>
              <span className="opacity-40">•</span>
              <span
                className={
                  theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"
                }
              >
                {playlist.followers || "Curated for you"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Playlist Actions & Track Table */}
      <div className="px-4 pb-36 sm:pb-24 lg:px-6 lg:pb-6">
        <div className="mb-3 flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.88 }}
            onClick={handlePlayAll}
            disabled={playlist.tracks.length === 0}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500 text-white shadow-lg shadow-red-500/30 transition hover:bg-red-400 disabled:opacity-40"
            title="Play playlist"
          >
            <Play size={20} fill="currentColor" className="ml-0.5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsLikedPlaylist((v) => !v)}
            className={`
              p-2 transition
              ${
                isLikedPlaylist
                  ? "text-red-500"
                  : theme === "dark"
                  ? "text-[#b3b3b3] hover:text-white"
                  : "text-stone-400 hover:text-stone-900"
              }
            `}
            title="Save playlist to library"
          >
            <Heart
              size={28}
              fill={isLikedPlaylist ? "currentColor" : "none"}
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleShare}
            className={`
              p-2 transition
              ${
                theme === "dark"
                  ? "text-[#b3b3b3] hover:text-white"
                  : "text-stone-400 hover:text-stone-900"
              }
            `}
            title="Share playlist link"
          >
            <Share2 size={24} />
          </motion.button>

          {showShareToast && (
            <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-md animate-bounce">
              Link copied!
            </span>
          )}
        </div>

        {/* Track Table Header */}
        <TrackHeader />

        {/* Tracks List */}
        <div className="space-y-1">
          {playlist.tracks.map((track, index) => (
            <TrackRow key={track.id + index} track={track} index={index} />
          ))}

          {playlist.tracks.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-3xl mb-2">🎵</p>
              <h3 className="text-lg font-bold">No songs in this playlist yet</h3>
              <p
                className={`text-xs mt-1 ${
                  theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"
                }`}
              >
                Click the heart icon on any song to add it to your Liked Songs!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
