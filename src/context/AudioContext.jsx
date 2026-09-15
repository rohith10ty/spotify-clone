import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { defaultTrack, playlists, songs } from "@/data/musicData";
import { LIVE_PLAYLIST_THEMES } from "@/services/musicApi";

export const AudioContext = createContext(null);

// Default Backend API Base URL for sumitkolhe's jiosaavn-api running locally
export const API_BASE_URL =
  import.meta.env.VITE_JIOSAAVN_API_URL || "http://localhost:3000/api";

/**
 * Utility: Decode HTML entities from JioSaavn text fields (e.g. &quot; -> ", &amp; -> &)
 */
function decodeHtmlEntities(str) {
  if (!str || typeof str !== "string") return str || "";
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

/**
 * Normalizer: Converts raw JioSaavn API song objects into the standard Player Track structure
 */
export function formatSaavnSong(raw) {
  if (!raw) return null;

  // Already formatted
  if (raw.audioUrl && raw.title && raw.image) {
    return raw;
  }

  // Pick highest quality streaming URL available (320kbps -> 160kbps -> 96kbps)
  let audioUrl = "";
  if (Array.isArray(raw.downloadUrl) && raw.downloadUrl.length > 0) {
    const sorted = [...raw.downloadUrl].reverse();
    audioUrl =
      raw.downloadUrl.find((d) => d.quality === "320kbps")?.url ||
      raw.downloadUrl.find((d) => d.quality === "160kbps")?.url ||
      sorted[0]?.url ||
      sorted[0]?.link ||
      "";
  } else if (typeof raw.downloadUrl === "string") {
    audioUrl = raw.downloadUrl;
  } else if (raw.url && typeof raw.url === "string" && raw.url.endsWith(".mp3")) {
    audioUrl = raw.url;
  }

  // Pick highest quality album image (500x500 -> 150x150 -> 50x50)
  let image = "";
  if (Array.isArray(raw.image) && raw.image.length > 0) {
    image =
      raw.image.find((i) => i.quality === "500x500")?.url ||
      raw.image.find((i) => i.quality === "150x150")?.url ||
      raw.image[raw.image.length - 1]?.url ||
      raw.image[raw.image.length - 1]?.link ||
      "";
  } else if (typeof raw.image === "string") {
    image = raw.image;
  }

  // Fallback placeholder image if missing
  if (!image) {
    image = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85";
  }

  // Primary Artists string
  let artist = "Unknown Artist";
  if (typeof raw.primaryArtists === "string" && raw.primaryArtists.trim()) {
    artist = raw.primaryArtists;
  } else if (raw.artists?.primary && Array.isArray(raw.artists.primary)) {
    artist = raw.artists.primary.map((a) => a.name).join(", ");
  } else if (typeof raw.artist === "string") {
    artist = raw.artist;
  }

  // Song title / name
  const title = decodeHtmlEntities(raw.name || raw.title || "Untitled Song");
  const albumName = decodeHtmlEntities(
    typeof raw.album === "object" ? raw.album?.name : raw.album || "Single",
  );

  // Parse duration
  const seconds = Number(raw.duration) || 240;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedDuration = `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;

  return {
    id: String(raw.id || `track-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`),
    title,
    artist: decodeHtmlEntities(artist),
    album: albumName,
    image,
    duration: formattedDuration,
    seconds,
    audioUrl,
    streamUrl: audioUrl,
    language: raw.language ? raw.language.charAt(0).toUpperCase() + raw.language.slice(1) : "Telugu",
    genre: raw.genre || "Soundtrack",
    year: raw.year || "",
    raw,
  };
}

/**
 * Async API Helper: Fetch search songs from local JioSaavn API server
 */
export async function fetchSearchSongs(query, page = 1, limit = 20) {
  if (!query || !query.trim()) return [];
  try {
    const url = `${API_BASE_URL}/search/songs?query=${encodeURIComponent(query.trim())}&page=${page}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`JioSaavn API search failed with status: ${res.status}`);
    }
    const data = await res.json();
    const results = data?.data?.results || data?.results || [];
    return results.map(formatSaavnSong).filter(Boolean);
  } catch (error) {
    console.warn("JioSaavn API search unavailable, falling back:", error);
    // Fallback search within bundled mock library
    const q = query.toLowerCase().trim();
    return songs.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.artist.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q),
    );
  }
}

/**
 * Async API Helper: Fetch single song details by ID from JioSaavn API
 */
export async function resolveSongDetails(id) {
  if (!id) return null;
  const local = songs.find((s) => String(s.id) === String(id));
  if (local) return local;

  try {
    const res = await fetch(`${API_BASE_URL}/songs?id=${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      const results = Array.isArray(data?.data)
        ? data.data
        : data?.data?.results || (data?.data ? [data.data] : []);
      if (results.length > 0) {
        return formatSaavnSong(results[0]);
      }
    }
  } catch (e) {
    console.warn("resolveSongDetails API fetch error:", e);
  }

  // Fallback search by ID
  try {
    const searchRes = await fetchSearchSongs(String(id), 1, 1);
    if (searchRes && searchRes.length > 0) {
      return searchRes[0];
    }
  } catch (e) {
    console.warn("resolveSongDetails search fallback error:", e);
  }

  return null;
}

/**
 * Global Audio Provider Component
 */
export function AudioProvider({ children }) {
  // Persistent HTML5 Audio Instance
  const audioRef = useRef(null);

  // Player States
  const [currentTrack, setCurrentTrack] = useState(() => {
    return defaultTrack;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100 percentage
  const [currentTime, setCurrentTime] = useState(0); // in seconds
  const [duration, setDuration] = useState(240); // in seconds
  const [volume, setVolume] = useState(80); // 0 to 100
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(80);
  const [shuffle, setShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // 'off' | 'all' | 'one'
  const [activeQueue, setActiveQueue] = useState(songs);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLanguage, setActiveLanguage] = useState("All");
  const [audioError, setAudioError] = useState(null);

  // Initialize and attach native HTML5 Audio element listeners
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.preload = "auto";
    audio.volume = volume / 100;

    // Time update listener: Updates exact seek percentage and elapsed seconds
    const handleTimeUpdate = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        const cur = audio.currentTime;
        const dur = audio.duration;
        setCurrentTime(cur);
        setDuration(dur);
        setProgress((cur / dur) * 100);
      }
    };

    // Loaded metadata listener: sync duration
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
      setAudioError(null);
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setAudioError(null);
    };
    const handlePause = () => setIsPlaying(false);

    // Song ended listener: Auto-play next or repeat
    const handleEnded = () => {
      if (repeatMode === "one") {
        audio.currentTime = 0;
        audio.play().catch((err) => console.error("Repeat play error:", err));
      } else {
        playNext();
      }
    };

    // Error listener
    const handleError = (e) => {
      console.warn("HTML5 Audio playback error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      if (audio.src && audio.src !== "about:blank" && !audio.src.endsWith("/")) {
        setAudioError("Audio playback error. Stream may be unavailable or CORS restricted.");
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("waiting", handleWaiting);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("waiting", handleWaiting);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
    };
  }, [repeatMode]);

  // Liked Songs persisted in localStorage (storing complete track objects)
  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const savedTracks = localStorage.getItem("spotify_liked_tracks");
      if (savedTracks) {
        const parsed = JSON.parse(savedTracks);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed
            .map(formatSaavnSong)
            .filter((t) => t && t.title && t.title !== "Favorited Song");
          if (valid.length > 0) return valid;
        }
      }
      // Migrate from old spotify_liked_songs ID array if existing
      const savedIds = localStorage.getItem("spotify_liked_songs");
      if (savedIds) {
        const parsedIds = JSON.parse(savedIds);
        if (Array.isArray(parsedIds) && parsedIds.length > 0) {
          const migrated = parsedIds
            .map((id) => songs.find((s) => String(s.id) === String(id)))
            .filter(Boolean);
          if (migrated.length > 0) return migrated;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return [
      songs.find((s) => s.id === "samajavaragamana") || songs[0],
      songs.find((s) => s.id === "blinding-lights") || songs[1],
      songs.find((s) => s.id === "arabic-kuthu") || songs[2],
      songs.find((s) => s.id === "kesariya") || songs[3],
      songs.find((s) => s.id === "darshana") || songs[4],
      songs.find((s) => s.id === "singara-siriye") || songs[5],
      songs.find((s) => s.id === "june-pothe") || songs[6],
    ].filter(Boolean);
  });

  const likedSongIds = useMemo(() => {
    return likedSongs.map((s) => String(s.id));
  }, [likedSongs]);

  // Background resolver: Auto-upgrade any placeholder songs with real metadata from API
  useEffect(() => {
    const hasPlaceholders = likedSongs.some(
      (s) => !s.title || s.title === "Favorited Song" || s.artist === "Artist",
    );
    if (!hasPlaceholders) return;

    let isMounted = true;
    (async () => {
      const updated = await Promise.all(
        likedSongs.map(async (track) => {
          if (!track.title || track.title === "Favorited Song" || track.artist === "Artist") {
            const real = await resolveSongDetails(track.id);
            if (real && real.title && real.title !== "Favorited Song") {
              return real;
            }
          }
          return track;
        }),
      );
      if (isMounted) {
        const clean = updated.filter(
          (t) => t && t.title && t.title !== "Favorited Song",
        );
        setLikedSongs(clean.length > 0 ? clean : songs.slice(0, 7));
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // Custom user playlists state
  const [customPlaylists, setCustomPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem("spotify_custom_playlists");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  // User Profile and Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const savedAuth = localStorage.getItem("spotify_is_authenticated");
      return savedAuth !== null ? JSON.parse(savedAuth) : true;
    } catch {
      return true;
    }
  });

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("spotify_user_profile");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      name: "Rohith Naidu",
      email: "rohith.naidu@spotify.me",
      handle: "@rohithnaidu",
      avatar: "/profile-avatar.jpg",
      plan: "Spotify Premium",
      playlistsCount: 14,
      followingCount: 48,
      followersCount: 219,
      audioQuality: "Very High (320 kbps)",
      preferredLanguage: "Telugu & English",
    };
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // 'login' | 'signup'

  const openAuthModal = useCallback((mode = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const loginUser = useCallback(({ email, name, avatar, plan }) => {
    const displayName = name || (email ? email.split("@")[0] : "Music Lover");
    const user = {
      name: displayName,
      email: email || `${displayName.toLowerCase().replace(/\s+/g, "")}@spotify.me`,
      handle: `@${displayName.toLowerCase().replace(/\s+/g, "")}`,
      avatar: avatar || "/profile-avatar.jpg",
      plan: plan || "Spotify Premium",
      playlistsCount: 14,
      followingCount: 48,
      followersCount: 219,
      audioQuality: "Very High (320 kbps)",
      preferredLanguage: "Telugu & English",
    };
    setUserProfile(user);
    setIsAuthenticated(true);
    localStorage.setItem("spotify_is_authenticated", "true");
    localStorage.setItem("spotify_user_profile", JSON.stringify(user));
  }, []);

  const signupUser = useCallback(({ name, email, preferredLanguage }) => {
    const displayName = name || "New Listener";
    const user = {
      name: displayName,
      email: email || "listener@spotify.me",
      handle: `@${displayName.toLowerCase().replace(/\s+/g, "")}`,
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
      plan: "Spotify Premium (Trial)",
      playlistsCount: 0,
      followingCount: 5,
      followersCount: 12,
      audioQuality: "Very High (320 kbps)",
      preferredLanguage: preferredLanguage || "Telugu",
    };
    setUserProfile(user);
    setIsAuthenticated(true);
    localStorage.setItem("spotify_is_authenticated", "true");
    localStorage.setItem("spotify_user_profile", JSON.stringify(user));
  }, []);

  const logoutUser = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.setItem("spotify_is_authenticated", "false");
  }, []);

  useEffect(() => {
    localStorage.setItem("spotify_liked_tracks", JSON.stringify(likedSongs));
    localStorage.setItem("spotify_liked_songs", JSON.stringify(likedSongIds));
  }, [likedSongs, likedSongIds]);

  useEffect(() => {
    localStorage.setItem("spotify_custom_playlists", JSON.stringify(customPlaylists));
  }, [customPlaylists]);

  useEffect(() => {
    localStorage.setItem("spotify_user_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  /**
   * Core Playback Action: Play a specific track with optional custom queue
   */
  const playTrack = useCallback(
    async (rawTrack, queue = null) => {
      if (!rawTrack) return;
      let track = formatSaavnSong(rawTrack);
      const audio = audioRef.current;

      setCurrentTrack(track);
      setAudioError(null);
      setProgress(0);
      setCurrentTime(0);

      if (queue && Array.isArray(queue) && queue.length > 0) {
        const formattedQueue = queue.map(formatSaavnSong).filter(Boolean);
        setActiveQueue(formattedQueue);
      }

      let streamUrl = track.audioUrl || track.streamUrl || track.url || "";

      // If track does not have a live streaming URL, dynamically fetch from JioSaavn API!
      if (!streamUrl) {
        setIsLoading(true);
        try {
          const liveQuery = `${track.title} ${track.artist || ""}`.trim();
          const searchResults = await fetchSearchSongs(liveQuery, 1, 1);
          if (searchResults && searchResults.length > 0 && searchResults[0].audioUrl) {
            streamUrl = searchResults[0].audioUrl;
            track = {
              ...track,
              audioUrl: streamUrl,
              streamUrl: streamUrl,
              image: searchResults[0].image || track.image,
              duration: searchResults[0].duration || track.duration,
              seconds: searchResults[0].seconds || track.seconds,
            };
            setCurrentTrack(track);
          }
        } catch (e) {
          console.warn("Failed to auto-resolve live stream URL:", e);
        }
      }

      // If backend is offline, provide smooth audio stream fallback
      if (!streamUrl) {
        streamUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        track = {
          ...track,
          audioUrl: streamUrl,
          streamUrl: streamUrl,
        };
      }

      if (audio) {
        audio.src = streamUrl;
        setIsLoading(true);
        audio.load();
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setIsLoading(false);
            })
            .catch((err) => {
              console.warn("Autoplay / stream play warning:", err);
              setIsLoading(false);
              setIsPlaying(true);
            });
        }
      }
    },
    [],
  );

  /**
   * Toggle Play / Pause
   */
  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      let srcToPlay = audio.src;
      if (!srcToPlay || srcToPlay === "about:blank" || srcToPlay.endsWith("/")) {
        srcToPlay =
          currentTrack.audioUrl ||
          currentTrack.streamUrl ||
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        audio.src = srcToPlay;
        audio.load();
      }
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn("Playback resume error:", err);
            setIsPlaying(true);
          });
      } else {
        setIsPlaying(true);
      }
    }
  }, [isPlaying, currentTrack]);

  /**
   * Seek by percentage (0 - 100)
   */
  const seekProgress = useCallback((percentage) => {
    const audio = audioRef.current;
    const p = Math.max(0, Math.min(100, Number(percentage)));
    setProgress(p);

    if (audio && audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      const targetTime = (p / 100) * audio.duration;
      audio.currentTime = targetTime;
      setCurrentTime(targetTime);
    } else if (currentTrack.seconds) {
      setCurrentTime((p / 100) * currentTrack.seconds);
    }
  }, [currentTrack]);

  /**
   * Seek by direct seconds
   */
  const seekTime = useCallback((seconds) => {
    const audio = audioRef.current;
    const sec = Math.max(0, Number(seconds));
    setCurrentTime(sec);

    if (audio && audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
      audio.currentTime = Math.min(sec, audio.duration);
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  }, []);

  /**
   * Volume control (0 - 100)
   */
  const handleVolumeChange = useCallback((newVol) => {
    const audio = audioRef.current;
    const val = Math.max(0, Math.min(100, Number(newVol)));
    setVolume(val);

    if (audio) {
      audio.volume = val / 100;
      if (val > 0 && isMuted) {
        audio.muted = false;
        setIsMuted(false);
      }
    }
  }, [isMuted]);

  /**
   * Mute / Unmute
   */
  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (isMuted) {
      setIsMuted(false);
      if (audio) {
        audio.muted = false;
        audio.volume = prevVolume / 100;
      }
      setVolume(prevVolume);
    } else {
      setPrevVolume(volume);
      setIsMuted(true);
      if (audio) {
        audio.muted = true;
        audio.volume = 0;
      }
    }
  }, [isMuted, volume, prevVolume]);

  /**
   * Toggle Repeat: 'off' -> 'all' -> 'one'
   */
  const toggleRepeat = useCallback(() => {
    setRepeatMode((prev) => {
      if (prev === "off") return "all";
      if (prev === "all") return "one";
      return "off";
    });
  }, []);

  const currentIndex = useMemo(() => {
    return activeQueue.findIndex((t) => String(t.id) === String(currentTrack.id));
  }, [activeQueue, currentTrack]);

  /**
   * Next Song
   */
  const playNext = useCallback(() => {
    if (activeQueue.length === 0) return;
    if (shuffle) {
      const randomIndex = Math.floor(Math.random() * activeQueue.length);
      playTrack(activeQueue[randomIndex]);
    } else {
      const nextIndex = (currentIndex + 1) % activeQueue.length;
      playTrack(activeQueue[nextIndex]);
    }
  }, [activeQueue, shuffle, currentIndex, playTrack]);

  /**
   * Previous Song
   */
  const playPrevious = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    if (activeQueue.length === 0) return;
    const prevIndex =
      currentIndex <= 0 ? activeQueue.length - 1 : currentIndex - 1;
    playTrack(activeQueue[prevIndex]);
  }, [activeQueue, currentIndex, playTrack]);

  /**
   * Like / Favorite toggling - Supports passing track object, string ID, or currentTrack
   */
  const toggleLike = useCallback(
    (trackOrId, optionalTrack = null) => {
      if (!trackOrId) return;

      const isObj = typeof trackOrId === "object" && trackOrId !== null;
      const targetId = isObj ? String(trackOrId.id) : String(trackOrId);
      let targetTrack = isObj ? trackOrId : optionalTrack;

      setLikedSongs((prev) => {
        const isAlreadyLiked = prev.some((t) => String(t.id) === targetId);

        if (isAlreadyLiked) {
          return prev.filter((t) => String(t.id) !== targetId);
        } else {
          // If track object wasn't directly passed, find it in currentTrack, activeQueue, or songs
          if (!targetTrack) {
            if (currentTrack && String(currentTrack.id) === targetId) {
              targetTrack = currentTrack;
            } else if (activeQueue && activeQueue.length > 0) {
              targetTrack = activeQueue.find((t) => String(t.id) === targetId);
            }
            if (!targetTrack) {
              targetTrack = songs.find((t) => String(t.id) === targetId);
            }
          }

          let formatted = formatSaavnSong(targetTrack);
          if (!formatted || formatted.title === "Favorited Song" || !formatted.title) {
            // Asynchronously resolve in background if needed
            resolveSongDetails(targetId).then((realTrack) => {
              if (realTrack && realTrack.title && realTrack.title !== "Favorited Song") {
                setLikedSongs((curr) =>
                  curr.map((item) => (String(item.id) === targetId ? realTrack : item)),
                );
              }
            });

            formatted = {
              id: targetId,
              title: currentTrack?.id === targetId ? currentTrack.title : targetId,
              artist: currentTrack?.id === targetId ? currentTrack.artist : "Artist",
              album: currentTrack?.id === targetId ? currentTrack.album : "Single",
              image:
                currentTrack?.id === targetId
                  ? currentTrack.image
                  : "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85",
              duration: currentTrack?.id === targetId ? currentTrack.duration : "3:30",
              seconds: currentTrack?.id === targetId ? currentTrack.seconds : 210,
              audioUrl: currentTrack?.id === targetId ? currentTrack.audioUrl : "",
            };
          }

          return [formatted, ...prev.filter((t) => String(t.id) !== targetId)];
        }
      });
    },
    [currentTrack, activeQueue],
  );

  const isLiked = useCallback(
    (trackOrId) => {
      if (!trackOrId) return false;
      const sId =
        typeof trackOrId === "object" && trackOrId !== null
          ? String(trackOrId.id)
          : String(trackOrId);
      return likedSongs.some((t) => String(t.id) === sId);
    },
    [likedSongs],
  );

  /**
   * Playlist Creation
   */
  const createCustomPlaylist = useCallback(
    ({ title, description, image }) => {
      const newPlaylist = {
        id: `custom-${Date.now()}`,
        title: title || "My Custom Playlist",
        description: description || `Created by ${userProfile.name}`,
        owner: userProfile.name || "Rohith Naidu",
        followers: "1 save",
        image:
          image ||
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=85",
        tracks: [currentTrack],
        isCustom: true,
      };
      setCustomPlaylists((prev) => [newPlaylist, ...prev]);
      return newPlaylist;
    },
    [userProfile, currentTrack],
  );

  // Dynamic Liked Songs playlist
  const likedSongsList = likedSongs;

  const allPlaylists = useMemo(() => {
    const likedPlaylist = {
      id: "liked",
      title: "Liked Songs",
      description: `Your collected favorites (${likedSongs.length} tracks).`,
      owner: userProfile.name,
      followers: `${likedSongs.length} songs`,
      image:
        "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=700&q=85",
      tracks: likedSongs,
      isLikedPlaylist: true,
    };

    const liveThemedPlaylists = LIVE_PLAYLIST_THEMES.map((pt) => ({
      id: pt.id,
      title: pt.title,
      description: pt.description,
      owner: pt.owner,
      image: pt.image,
      tracks: songs
        .filter((s) =>
          pt.id === "live-telugu"
            ? s.language === "Telugu"
            : pt.id === "live-tamil"
            ? s.language === "Tamil"
            : pt.id === "live-hindi"
            ? s.language === "Hindi"
            : pt.id === "live-global"
            ? s.language === "English"
            : true,
        )
        .slice(0, 8),
      language: "All",
    }));

    return [
      likedPlaylist,
      ...customPlaylists,
      ...liveThemedPlaylists,
      ...playlists,
    ];
  }, [likedSongs, customPlaylists, userProfile]);

  const value = useMemo(
    () => ({
      // Audio State
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
      audioError,

      // Authentication State
      isAuthenticated,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      loginUser,
      signupUser,
      logoutUser,

      // User & Library State
      likedSongs,
      likedSongIds,
      likedSongsList,
      customPlaylists,
      allPlaylists,
      userProfile,
      searchQuery,
      activeLanguage,

      // Playback Controls
      playTrack,
      togglePlay,
      playNext,
      playPrevious,
      seekProgress,
      seekTime,
      handleVolumeChange,
      toggleMute,
      setShuffle,
      toggleRepeat,
      toggleLike,
      isLiked,
      createCustomPlaylist,
      setUserProfile,
      setSearchQuery,
      setActiveLanguage,
      setActiveQueue,

      // API Search & Resolver Methods
      fetchSearchSongs,
      resolveSongDetails,
    }),
    [
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
      audioError,
      isAuthenticated,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      loginUser,
      signupUser,
      logoutUser,
      likedSongs,
      likedSongIds,
      likedSongsList,
      customPlaylists,
      allPlaylists,
      userProfile,
      searchQuery,
      activeLanguage,
      playTrack,
      togglePlay,
      playNext,
      playPrevious,
      seekProgress,
      seekTime,
      handleVolumeChange,
      toggleMute,
      toggleRepeat,
      toggleLike,
      isLiked,
      createCustomPlaylist,
    ],
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
}

/**
 * Custom Hook: useAudio
 */
export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

// Backward-compatibility aliases for existing usePlayer imports
export const usePlayer = useAudio;
export const PlayerProvider = AudioProvider;
export default AudioContext;
