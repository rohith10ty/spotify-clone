import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Eye,
  EyeOff,
  Globe,
  Headphones,
  Lock,
  Mail,
  Music,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { useTheme } from "@/context/ThemeContext";

const LANGUAGES = [
  "Telugu",
  "Tamil",
  "Hindi",
  "English",
  "Malayalam",
  "Kannada",
  "Punjabi",
];

export default function AuthModal({ isOpen, onClose, initialMode = "login" }) {
  const { theme } = useTheme();
  const { loginUser, signupUser } = usePlayer();

  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("Telugu");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleLogin = (e) => {
    e?.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email or username");
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Please enter your password");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      loginUser({
        email: email.trim(),
        name: name.trim() || email.split("@")[0],
        password,
      });
      setIsLoading(false);
      setSuccessMsg("Welcome back! Logged in successfully.");
      setTimeout(() => {
        onClose();
      }, 600);
    }, 500);
  };

  const handleSignup = (e) => {
    e?.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("Please enter your name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      signupUser({
        name: name.trim(),
        email: email.trim(),
        password,
        preferredLanguage: selectedLanguage,
      });
      setIsLoading(false);
      setSuccessMsg("Account created! Enjoy unlimited music.");
      setTimeout(() => {
        onClose();
      }, 600);
    }, 550);
  };

  const handleQuickDemo = (demoType) => {
    setIsLoading(true);
    setTimeout(() => {
      if (demoType === "rohith") {
        loginUser({
          name: "Rohith Naidu",
          email: "rohith.naidu@spotify.me",
          avatar: "/profile-avatar.jpg",
          plan: "Spotify Premium",
        });
      } else {
        loginUser({
          name: "Music Explorer",
          email: "explorer@spotify.me",
          avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
          plan: "Spotify Free VIP",
        });
      }
      setIsLoading(false);
      setSuccessMsg("Logged in instantly!");
      setTimeout(() => {
        onClose();
      }, 500);
    }, 450);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window Container - Fixed Shape & Unscrollable */}
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
          {/* Top Banner */}
          <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 px-5 py-3.5 text-white shrink-0">
            <button
              onClick={onClose}
              className="absolute right-3.5 top-3.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/60 cursor-pointer"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-600 shadow-sm shrink-0">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.35-1.434-5.308-1.758-8.793-.963-.335.077-.67-.133-.746-.468-.077-.334.132-.67.467-.746 3.809-.87 7.076-.51 9.721 1.113.294.18.388.563.208.857zm1.226-2.723c-.226.367-.707.482-1.074.256-2.69-1.653-6.79-2.134-9.97-1.168-.413.125-.852-.108-.977-.52-.125-.413.108-.853.52-.978 3.637-1.104 8.151-.572 11.245 1.336.367.226.482.707.256 1.074zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.494.15-1.018-.13-1.168-.624-.15-.493.13-1.018.624-1.168 3.532-1.072 9.404-.866 13.115 1.338.445.264.59.838.327 1.282-.264.444-.838.59-1.282.327z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight leading-tight">Spotify</h3>
                <p className="text-[11px] font-semibold text-white/90">
                  {mode === "login"
                    ? "Log in to continue listening"
                    : "Sign up for free music streaming"}
                </p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="mt-2.5 flex rounded-lg bg-black/25 p-0.5 backdrop-blur-md">
              <button
                type="button"
                onClick={() => handleModeSwitch("login")}
                className={`
                  flex-1 rounded-md py-1 text-center text-[11.5px] font-bold transition cursor-pointer
                  ${
                    mode === "login"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }
                `}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch("signup")}
                className={`
                  flex-1 rounded-md py-1 text-center text-[11.5px] font-bold transition cursor-pointer
                  ${
                    mode === "signup"
                      ? "bg-white text-stone-900 shadow-sm"
                      : "text-white/80 hover:text-white"
                  }
                `}
              >
                Sign Up Free
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 pt-3.5">
            {/* Notification messages */}
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-[11px] font-semibold text-red-500 text-center"
              >
                {errorMsg}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-[11px] font-bold text-emerald-500"
              >
                <Check size={14} />
                {successMsg}
              </motion.div>
            )}

            {/* Quick 1-Click Demo Logins */}
            <div className="mb-2.5">
              <p
                className={`
                mb-1 text-[10px] font-bold uppercase tracking-wider
                ${theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"}
              `}
              >
                ⚡ 1-Click Instant Demo Login
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo("rohith")}
                  className={`
                    flex items-center justify-center gap-1.5 rounded-lg border p-1.5 text-[11px] font-bold transition hover:scale-[1.02] cursor-pointer
                    ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-red-500/40"
                        : "border-stone-300 bg-[#ece7de] text-stone-900 hover:bg-stone-200"
                    }
                  `}
                >
                  <Sparkles size={12} className="text-red-500" />
                  Rohith Naidu
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo("guest")}
                  className={`
                    flex items-center justify-center gap-1.5 rounded-lg border p-1.5 text-[11px] font-bold transition hover:scale-[1.02] cursor-pointer
                    ${
                      theme === "dark"
                        ? "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-red-500/40"
                        : "border-stone-300 bg-[#ece7de] text-stone-900 hover:bg-stone-200"
                    }
                  `}
                >
                  <Headphones size={12} className="text-rose-500" />
                  Guest Explorer
                </button>
              </div>
            </div>

            <div className="relative my-2.5 flex items-center justify-center">
              <div
                className={`
                absolute inset-0 flex items-center
                ${theme === "dark" ? "border-white/10" : "border-stone-300"}
              `}
              >
                <div className="w-full border-t border-inherit" />
              </div>
              <span
                className={`
                relative px-2.5 text-[10px] font-semibold uppercase tracking-wider
                ${
                  theme === "dark"
                    ? "bg-[#181818] text-[#888]"
                    : "bg-[#faf8f5] text-stone-400"
                }
              `}
              >
                or with email
              </span>
            </div>

            {/* FORM */}
            <form
              onSubmit={mode === "login" ? handleLogin : handleSignup}
              className="space-y-2"
            >
              {mode === "signup" && (
                <div>
                  <label className="mb-0.5 block text-[11px] font-bold">
                    What should we call you?
                  </label>
                  <div
                    className={`
                    flex h-9 items-center rounded-lg border px-2.5 transition-all
                    ${
                      theme === "dark"
                        ? "bg-[#222] border-white/10 text-white focus-within:border-red-500"
                        : "bg-[#ece7de] border-stone-300 text-stone-900 focus-within:border-red-500 focus-within:bg-white"
                    }
                  `}
                  >
                    <User size={14} className="mr-2 opacity-50 shrink-0" />
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-[11.5px] font-medium outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-0.5 block text-[11px] font-bold">
                  Email or Username
                </label>
                <div
                  className={`
                  flex h-9 items-center rounded-lg border px-2.5 transition-all
                  ${
                    theme === "dark"
                      ? "bg-[#222] border-white/10 text-white focus-within:border-red-500"
                      : "bg-[#ece7de] border-stone-300 text-stone-900 focus-within:border-red-500 focus-within:bg-white"
                  }
                `}
                >
                  <Mail size={14} className="mr-2 opacity-50 shrink-0" />
                  <input
                    type="text"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-[11.5px] font-medium outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-0.5 block text-[11px] font-bold">Password</label>
                <div
                  className={`
                  flex h-9 items-center rounded-lg border px-2.5 transition-all
                  ${
                    theme === "dark"
                      ? "bg-[#222] border-white/10 text-white focus-within:border-red-500"
                      : "bg-[#ece7de] border-stone-300 text-stone-900 focus-within:border-red-500 focus-within:bg-white"
                  }
                `}
                >
                  <Lock size={14} className="mr-2 opacity-50 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-[11.5px] font-medium outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="p-1 opacity-60 hover:opacity-100 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="mb-0.5 block text-[11px] font-bold">
                    Primary Music Language
                  </label>
                  <div
                    className={`
                    flex h-9 items-center rounded-lg border px-2.5 transition-all
                    ${
                      theme === "dark"
                        ? "bg-[#222] border-white/10 text-white focus-within:border-red-500"
                        : "bg-[#ece7de] border-stone-300 text-stone-900 focus-within:border-red-500 focus-within:bg-white"
                    }
                  `}
                  >
                    <Globe size={14} className="mr-2 opacity-50 shrink-0" />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className={`
                        w-full bg-transparent text-[11.5px] font-medium outline-none cursor-pointer
                        ${theme === "dark" ? "text-white" : "text-stone-900"}
                      `}
                    >
                      {LANGUAGES.map((lang) => (
                        <option
                          key={lang}
                          value={lang}
                          className={theme === "dark" ? "bg-[#222] text-white" : "bg-white text-stone-900"}
                        >
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-red-500 rounded"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        "Demo mode: You can log in using any email or the 1-Click Instant Login buttons!",
                      )
                    }
                    className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isLoading}
                className="mt-2.5 flex h-10 w-full items-center justify-center rounded-full bg-red-500 font-bold text-xs text-white shadow-md shadow-red-500/25 transition hover:bg-red-600 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : mode === "login" ? (
                  "Log In"
                ) : (
                  "Create Account"
                )}
              </motion.button>
            </form>

            <div className="mt-2.5 text-center">
              <p
                className={`text-[11px] ${
                  theme === "dark" ? "text-[#a7a7a7]" : "text-stone-500"
                }`}
              >
                {mode === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch("signup")}
                      className="font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Sign up for free
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleModeSwitch("login")}
                      className="font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      Log in here
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
