import { ArrowUpRight, List, Plus, Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import CreatePlaylistModal from "./CreatePlaylistModal";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import { artists } from "@/data/musicData";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { allPlaylists, likedSongIds } = usePlayer();

  const [activeFilter, setActiveFilter] = useState("All"); // 'All' | 'Playlists' | 'Artists'
  const [searchLibraryQuery, setSearchLibraryQuery] = useState("");
  const [showLibrarySearch, setShowLibrarySearch] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recents"); // 'recents' | 'alphabetical'

  // Combine playlists and artists into library items
  const libraryItems = useMemo(() => {
    const playlistItems = allPlaylists.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle:
        p.id === "liked"
          ? `Playlist • ${likedSongIds.length} songs`
          : `Playlist • ${p.owner}`,
      image: p.image,
      route: `/playlist/${p.id}`,
      type: "Playlists",
      artist: false,
    }));

    const artistItems = artists.map((a) => ({
      id: a.id,
      title: a.name,
      subtitle: `Artist • ${a.language}`,
      image: a.image,
      route: `/artist/${a.id}`,
      type: "Artists",
      artist: true,
    }));

    let combined = [...playlistItems, ...artistItems];

    if (activeFilter !== "All") {
      combined = combined.filter((item) => item.type === activeFilter);
    }

    if (searchLibraryQuery.trim()) {
      const q = searchLibraryQuery.toLowerCase().trim();
      combined = combined.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q),
      );
    }

    if (sortBy === "alphabetical") {
      combined.sort((a, b) => a.title.localeCompare(b.title));
    }

    return combined;
  }, [allPlaylists, likedSongIds, activeFilter, searchLibraryQuery, sortBy]);

  const toggleSort = () => {
    setSortBy((prev) => (prev === "recents" ? "alphabetical" : "recents"));
  };

  return (
    <>
      <aside
        className={`
          spotify-panel hidden min-h-0 flex-col overflow-hidden lg:flex transition-colors duration-200
          ${
            theme === "dark"
              ? "bg-[#121212] text-white border-white/[0.06]"
              : "bg-[#faf8f5] text-stone-900 border-stone-300/60 shadow-sm"
          }
        `}
      >
        {/* Header: Library Title + Action Buttons */}
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <h2 className="text-[16px] font-bold">Your Library</h2>

          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => setIsCreateModalOpen(true)}
              className={`
                flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer
                ${
                  theme === "dark"
                    ? "text-[#b3b3b3] hover:text-white hover:bg-white/10"
                    : "text-stone-600 hover:text-stone-900 hover:bg-[#ece7de]"
                }
              `}
              title="Create new playlist"
            >
              <Plus size={22} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => navigate("/search")}
              className={`
                flex h-9 w-9 items-center justify-center rounded-full transition cursor-pointer
                ${
                  theme === "dark"
                    ? "text-[#b3b3b3] hover:text-white hover:bg-white/10"
                    : "text-stone-600 hover:text-stone-900 hover:bg-[#ece7de]"
                }
              `}
              title="Browse all"
            >
              <ArrowUpRight size={18} />
            </motion.button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto px-4 pt-1.5 pb-2.5 scrollbar-none">
          {["All", "Playlists", "Artists"].map((filter) => (
            <InteractiveHoverButton
              key={filter}
              text={filter}
              isActive={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            />
          ))}
        </div>

        {/* Search within Library & Sort Controls */}
        <div className="flex items-center justify-between px-4 pb-2">
          {showLibrarySearch ? (
            <div className="flex flex-1 items-center gap-2 pr-2">
              <input
                value={searchLibraryQuery}
                onChange={(e) => setSearchLibraryQuery(e.target.value)}
                placeholder="Search in Library..."
                className={`
                  w-full rounded-md px-2.5 py-1 text-xs outline-none
                  ${
                    theme === "dark"
                      ? "bg-[#222] text-white border border-white/10"
                      : "bg-[#ece7de] text-stone-900 border border-stone-300/80"
                  }
                `}
                autoFocus
              />
              <button
                onClick={() => {
                  setShowLibrarySearch(false);
                  setSearchLibraryQuery("");
                }}
                className="opacity-70 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.08 }}
              onClick={() => setShowLibrarySearch(true)}
              className={`
                flex h-8 w-8 items-center justify-center rounded-full transition
                ${
                  theme === "dark"
                    ? "text-[#b3b3b3] hover:text-white hover:bg-white/10"
                    : "text-stone-600 hover:text-stone-900 hover:bg-[#ece7de]"
                }
              `}
              title="Search Library"
            >
              <Search size={16} />
            </motion.button>
          )}

          <button
            onClick={toggleSort}
            className={`
              flex items-center gap-1.5 text-[12px] font-semibold transition
              ${
                theme === "dark"
                  ? "text-[#b3b3b3] hover:text-white"
                  : "text-stone-600 hover:text-stone-900"
              }
            `}
            title="Click to toggle sorting"
          >
            <span>
              {sortBy === "recents" ? "Recents" : "Alphabetical (A-Z)"}
            </span>
            <List size={15} />
          </button>
        </div>

        {/* Scrollable Library List */}
        <div className="spotify-scrollbar flex-1 overflow-y-auto px-2 pb-5">
          {libraryItems.map((item) => {
            const isActive = location.pathname === item.route;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 2 }}
                onClick={() => navigate(item.route)}
                className={`
                  group flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors
                  ${
                    isActive
                      ? theme === "dark"
                        ? "bg-white/10"
                        : "bg-red-500/10"
                      : theme === "dark"
                      ? "hover:bg-white/[0.06]"
                      : "hover:bg-[#ece7de]/70"
                  }
                `}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className={`
                    h-12 w-12 shrink-0 object-cover shadow-sm transition group-hover:scale-105
                    ${item.artist ? "rounded-full" : "rounded-md"}
                  `}
                />

                <div className="min-w-0 flex-1">
                  <p
                    className={`
                    truncate text-[14px] font-semibold
                    ${
                      isActive
                        ? "text-red-500 font-bold"
                        : theme === "dark"
                        ? "text-white"
                        : "text-stone-900"
                    }
                  `}
                  >
                    {item.title}
                  </p>

                  <p
                    className={`
                    mt-0.5 truncate text-[12px]
                    ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
                  `}
                  >
                    {item.subtitle}
                  </p>
                </div>
              </motion.button>
            );
          })}

          {libraryItems.length === 0 && (
            <div className="py-8 text-center text-xs opacity-60">
              No matching playlists or artists found.
            </div>
          )}
        </div>
      </aside>

      {/* Modal to create custom playlist */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
