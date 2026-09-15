import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MusicSection from "@/components/music/MusicSection";
import MusicCard from "@/components/music/MusicCard";
import { artists, playlists, songs } from "@/data/musicData";
import { useTheme } from "@/context/ThemeContext";
import { Play, Sparkles } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useLiveHome } from "@/hooks/useLiveMusic";

const LANGUAGES = [
  "All",
  "Telugu",
  "English",
  "Tamil",
  "Hindi",
  "Malayalam",
  "Kannada",
  "Podcasts",
];

export default function Home() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { playTrack } = usePlayer();
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  // Dynamic live songs and playlists from JioSaavn API with caching & fallback
  const { sections: liveSections, featuredPlaylists: livePlaylists, isLoading } =
    useLiveHome(selectedLanguage);

  // Filtered Playlists for the top section based on language
  const languagePlaylists = useMemo(() => {
    if (selectedLanguage === "All") {
      return livePlaylists.length > 0 ? livePlaylists : playlists;
    }
    const filtered = livePlaylists.filter(
      (p) => p.language === selectedLanguage || p.language === "All",
    );
    if (filtered.length > 0) return filtered;

    return livePlaylists.filter(
      (p) => p.id === "liked" || p.language === selectedLanguage,
    );
  }, [selectedLanguage, livePlaylists]);

  // Dynamic song sections on the bottom
  const bottomSongSections = useMemo(() => {
    if (selectedLanguage === "Podcasts") {
      return [
        {
          title: "🎙️ Top Podcasts & Talk Shows",
          language: "Podcasts",
          items: [
            {
              id: "ted-talks",
              title: "TED Talks Daily",
              subtitle: "Thought-provoking ideas daily.",
              image:
                "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=500&q=85",
              type: "podcast",
            },
            {
              id: "huberman-lab",
              title: "Huberman Lab",
              subtitle: "Science & science-based tools for everyday life.",
              image:
                "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=500&q=85",
              type: "podcast",
            },
            {
              id: "the-ranveer-show",
              title: "The Ranveer Show (TRS)",
              subtitle: "India's smartest podcast.",
              image:
                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=500&q=85",
              type: "podcast",
            },
          ],
        },
      ];
    }

    if (liveSections && liveSections.length > 0) {
      return liveSections;
    }

    const langSongs = songs.filter((s) => s.language === selectedLanguage);
    const langArtists = artists.filter((a) => a.language === selectedLanguage);

    const sections = [
      {
        title: `🔥 Top ${selectedLanguage} Hits`,
        language: selectedLanguage,
        items: langSongs.slice(0, 6).map((s) => ({
          id: s.id,
          title: s.title,
          subtitle: `${s.artist} • ${s.album}`,
          image: s.image,
          type: "song",
          track: s,
        })),
      },
    ];

    if (langArtists.length > 0) {
      sections.push({
        title: `🎤 Popular ${selectedLanguage} Artists`,
        language: selectedLanguage,
        items: langArtists.map((artist) => ({
          id: artist.id,
          title: artist.name,
          subtitle: `${artist.language} • Artist`,
          image: artist.image,
          type: "artist",
          round: true,
        })),
      });
    }

    return sections;
  }, [selectedLanguage, liveSections]);

  return (
    <main
      className={`
        spotify-page relative transition-colors duration-200
        ${
          theme === "dark"
            ? "bg-[#121212] text-white"
            : "bg-[#f5f2eb] text-stone-900"
        }
      `}
    >
      {/* Dynamic Header Gradient */}
      <div
        className={`
          pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-gradient-to-b transition-opacity duration-300
          ${
            theme === "dark"
              ? "from-red-950/40 via-[#181828]/40 to-transparent"
              : "from-amber-200/25 via-stone-200/20 to-transparent"
          }
        `}
      />

      {/* Sticky Language Filter Pills Header (Stable when scrolling) */}
      <div
        className={`
          sticky top-0 z-30 px-4 sm:px-6 pt-4 pb-3 transition-colors duration-200
          ${
            theme === "dark"
              ? "bg-[#121212]/95 backdrop-blur-xl border-b border-white/[0.04]"
              : "bg-[#f5f2eb]/95 backdrop-blur-xl border-b border-stone-300/60"
          }
        `}
      >
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar whitespace-nowrap">
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang;
            return (
              <InteractiveHoverButton
                key={lang}
                text={lang}
                isActive={isSelected}
                onClick={() => setSelectedLanguage(lang)}
              />
            );
          })}
        </div>
      </div>

      <div className="relative z-10 px-4 pb-36 sm:pb-24 pt-3 sm:px-6 lg:pb-6">
        {/* TOP: Playlists Section with Clear, Spacious, Perfectly Aligned Cards */}
        <div className="mb-6">
          <h2
            className={`
            mb-4 text-[22px] font-bold tracking-tight
            ${theme === "dark" ? "text-white" : "text-stone-900"}
          `}
          >
            {selectedLanguage === "All"
              ? "Featured Playlists & Mixes"
              : `${selectedLanguage} Playlists`}
          </h2>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {languagePlaylists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.025 }}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                className={`
                  group relative flex min-h-[76px] sm:min-h-[82px] cursor-pointer items-center overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:scale-[1.015]
                  ${
                    theme === "dark"
                      ? "bg-[#181818] border-white/[0.07] hover:bg-[#222222] text-white"
                      : "bg-[#faf8f5] border-stone-300/60 hover:bg-white text-stone-900 hover:shadow-md"
                  }
                `}
              >
                <img
                  src={playlist.image}
                  alt={playlist.title}
                  className="h-[76px] w-[76px] sm:h-[82px] sm:w-[82px] aspect-square object-cover shadow-sm shrink-0"
                />

                <div className="min-w-0 flex-1 py-2 px-3 sm:px-3.5 flex flex-col justify-center">
                  <p className="line-clamp-2 text-[14.5px] sm:text-[15.5px] font-bold leading-snug group-hover:text-red-500 transition-colors">
                    {playlist.title}
                  </p>
                  <p
                    className={`
                    mt-1 line-clamp-1 text-[12px] sm:text-[12.5px] font-medium leading-tight
                    ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
                  `}
                  >
                    {playlist.tracks.length} songs • {playlist.owner}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (playlist.tracks && playlist.tracks.length > 0) {
                      playTrack(playlist.tracks[0], playlist.tracks);
                    } else {
                      navigate(`/playlist/${playlist.id}`);
                    }
                  }}
                  className="
                    mr-3 sm:mr-3.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-white shadow-xl transition-all duration-200 hover:bg-red-400 group-hover:scale-105 opacity-0 group-hover:opacity-100
                  "
                  title="Play Playlist"
                >
                  <Play size={18} fill="currentColor" className="ml-[2px]" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* BOTTOM: Song Sections categorized by vibe/genre */}
        {bottomSongSections.map((section, index) => (
          <MusicSection
            key={section.title + selectedLanguage}
            title={section.title}
            items={section.items}
            delay={index * 0.03}
          />
        ))}
      </div>
    </main>
  );
}
