import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronRight,
  Headphones,
  Heart,
  Image as ImageIcon,
  LogOut,
  Moon,
  Radio,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  Upload,
  User,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";
import ThemeToggleButton from "@/components/ui/ThemeToggleButton";

export default function ProfileModal({ isOpen, onClose }) {
  const {
    userProfile,
    setUserProfile,
    likedSongIds,
    logoutUser,
    openAuthModal,
  } = usePlayer();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(userProfile.name);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setUserProfile((prev) => ({
            ...prev,
            avatar: uploadEvent.target.result,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    if (editedName.trim()) {
      setUserProfile((prev) => ({ ...prev, name: editedName.trim() }));
    }
    setIsEditingName(false);
  };

  return (
    <AnimatePresence>
      {/* Centered Modal Overlay */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window Container - Fixed Shape & Completely Unscrollable */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          className={`
            relative z-10 w-full max-w-[430px] overflow-hidden rounded-2xl border shadow-2xl transition-colors duration-200
            ${
              theme === "dark"
                ? "bg-[#181818] border-white/10 text-white"
                : "bg-[#faf8f5] border-stone-300 text-stone-900"
            }
          `}
        >
          {/* Header Banner using Sunset Background */}
          <div className="relative h-24 sm:h-26 w-full overflow-hidden shrink-0">
            <img
              src="/profile-banner.jpg"
              alt="Profile Sunset Banner"
              className="absolute inset-0 h-full w-full object-cover object-top"
              onError={(e) => {
                e.target.src = "/profile-full.jpg";
              }}
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/15" />

            <div className="relative z-10 flex h-full items-start justify-between p-3">
              <div className="flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-md px-2.5 py-0.5 text-white shadow-sm">
                <Sparkles size={12} className="text-amber-400" />
                <span className="text-[10px] font-bold tracking-wider uppercase">
                  Member Profile
                </span>
              </div>

              <button
                onClick={onClose}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/90 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Modal Main Content Body */}
          <div className="px-5 pb-4 pt-0">
            {/* Avatar on Left & Upload + Theme Controls on Right */}
            <div className="-mt-9 mb-2.5 flex items-end justify-between">
              {/* Round Avatar */}
              <div className="relative group">
                <div className="h-20 w-20 rounded-full overflow-hidden shadow-xl ring-4 ring-black/70 border-2 border-red-500 bg-[#222]">
                  <img
                    src={userProfile.avatar || "/profile-avatar.jpg"}
                    alt={userProfile.name}
                    className="h-full w-full object-cover object-center"
                    onError={(e) => {
                      e.target.src = "/profile-avatar.jpg";
                    }}
                  />
                </div>
              </div>

              {/* Controls on Right */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold transition shadow-sm cursor-pointer
                    ${
                      theme === "dark"
                        ? "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                        : "bg-[#ece7de] hover:bg-[#e4ded3] text-stone-800 border border-stone-300/80"
                    }
                  `}
                  title="Upload new profile photo"
                >
                  <Upload size={12} className="text-red-500" />
                  <span>Upload</span>
                </button>

                <ThemeToggleButton variant="circle" start="center" />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* User Title & Badge */}
            <div className="mb-2.5">
              <div className="flex items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                      className={`
                        rounded-lg border px-2 py-0.5 text-sm font-bold outline-none
                        ${
                          theme === "dark"
                            ? "bg-black/50 border-white/20 text-white"
                            : "bg-white border-stone-300 text-stone-900"
                        }
                      `}
                      autoFocus
                    />
                    <button
                      onClick={handleSaveName}
                      className="rounded-lg bg-red-500 px-2 py-0.5 text-xs font-bold text-white hover:bg-red-400"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <h2
                    onClick={() => setIsEditingName(true)}
                    className="cursor-pointer text-lg font-black hover:underline leading-tight"
                    title="Click to edit name"
                  >
                    {userProfile.name}
                  </h2>
                )}
                <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-bold text-red-400">
                  <ShieldCheck size={11} />
                  Premium
                </span>
              </div>
              <p className="text-[11px] text-[#a7a7a7] mt-0.5">
                {userProfile.handle} • Active Member
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="mb-2.5 grid grid-cols-4 gap-1.5 text-center">
              <div
                className={`
                rounded-xl p-1.5 transition
                ${theme === "dark" ? "bg-white/[0.04]" : "bg-[#f4f0e8]"}
              `}
              >
                <p className="text-sm font-bold">{userProfile.playlistsCount}</p>
                <p className="text-[9.5px] text-[#a7a7a7]">Playlists</p>
              </div>

              <div
                onClick={() => {
                  onClose();
                  navigate("/playlist/liked");
                }}
                className={`
                cursor-pointer rounded-xl p-1.5 transition hover:scale-105
                ${
                  theme === "dark"
                    ? "bg-white/[0.04] hover:bg-red-500/10"
                    : "bg-[#f4f0e8] hover:bg-red-50"
                }
              `}
              >
                <p className="text-sm font-bold text-red-500">
                  {likedSongIds.length}
                </p>
                <p className="text-[9.5px] text-[#a7a7a7]">Liked Songs</p>
              </div>

              <div
                className={`
                rounded-xl p-1.5 transition
                ${theme === "dark" ? "bg-white/[0.04]" : "bg-[#f4f0e8]"}
              `}
              >
                <p className="text-sm font-bold">{userProfile.followingCount}</p>
                <p className="text-[9.5px] text-[#a7a7a7]">Following</p>
              </div>

              <div
                className={`
                rounded-xl p-1.5 transition
                ${theme === "dark" ? "bg-white/[0.04]" : "bg-[#f4f0e8]"}
              `}
              >
                <p className="text-sm font-bold">{userProfile.followersCount}</p>
                <p className="text-[9.5px] text-[#a7a7a7]">Followers</p>
              </div>
            </div>

            {/* Preferences */}
            <div
              className={`
              space-y-1.5 rounded-xl p-2.5 mb-2.5
              ${
                theme === "dark"
                  ? "bg-white/[0.03] border border-white/5"
                  : "bg-[#f4f0e8] border border-stone-300/70"
              }
            `}
            >
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Headphones size={13} className="text-red-500" />
                  Streaming Quality
                </span>
                <select
                  value={userProfile.audioQuality}
                  onChange={(e) =>
                    setUserProfile((prev) => ({
                      ...prev,
                      audioQuality: e.target.value,
                    }))
                  }
                  className={`
                    rounded-lg px-2 py-0.5 text-[11px] font-semibold outline-none cursor-pointer
                    ${
                      theme === "dark"
                        ? "bg-[#252525] text-white border border-white/10"
                        : "bg-white border-stone-300 text-stone-800"
                    }
                  `}
                >
                  <option>Normal (96 kbps)</option>
                  <option>High (160 kbps)</option>
                  <option>Very High (320 kbps)</option>
                  <option>HiFi Lossless 24-bit (FLAC)</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-[11.5px]">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Radio size={13} className="text-rose-400" />
                  Languages
                </span>
                <span className="font-semibold text-red-400 text-[10.5px]">
                  Telugu, English, Tamil, Hindi, Malayalam, Kannada
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClose();
                  navigate("/playlist/liked");
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-red-500 py-2 text-xs font-bold text-white shadow-md shadow-red-500/25 transition hover:bg-red-400 active:scale-98 cursor-pointer"
              >
                <Heart size={13} fill="currentColor" />
                View Liked Songs ({likedSongIds.length})
              </button>

              <button
                onClick={onClose}
                className={`
                  rounded-full px-4 py-2 text-xs font-bold transition cursor-pointer
                  ${
                    theme === "dark"
                      ? "bg-white/10 hover:bg-white/20 text-white"
                      : "bg-stone-200 hover:bg-stone-300 text-stone-800"
                  }
                `}
              >
                Done
              </button>
            </div>

            {/* Log Out / Switch Account Button */}
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  logoutUser();
                }}
                className="flex items-center gap-1.5 text-[11.5px] font-bold text-red-400 hover:text-red-500 transition cursor-pointer"
              >
                <LogOut size={13} />
                Log out
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  openAuthModal("login");
                }}
                className="text-[11.5px] font-semibold opacity-60 hover:opacity-100 hover:underline transition cursor-pointer"
              >
                Switch Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
