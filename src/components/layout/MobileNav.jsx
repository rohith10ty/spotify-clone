import { Home, Library, Search } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";

const items = [
  {
    title: "Home",
    icon: Home,
    to: "/",
  },
  {
    title: "Search",
    icon: Search,
    to: "/search",
  },
  {
    title: "Your Library",
    icon: Library,
    to: "/playlist/liked",
  },
];

export default function MobileNav() {
  const { theme } = useTheme();

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-[60] grid h-[66px] grid-cols-3 border-t backdrop-blur-xl lg:hidden transition-colors duration-200
        ${
          theme === "dark"
            ? "bg-black/95 border-white/[0.08] text-white"
            : "bg-[#faf8f5]/95 border-stone-300/80 text-stone-900 shadow-lg"
        }
      `}
    >
      {items.map(({ title, icon: Icon, to }) => (
        <NavLink
          key={title}
          to={to}
          className={({ isActive }) => `
            flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition
            ${
              isActive
                ? "text-red-500 font-bold"
                : theme === "dark"
                ? "text-[#8d8d8d] hover:text-white"
                : "text-stone-400 hover:text-stone-900"
            }
          `}
        >
          {({ isActive }) => (
            <>
              <Icon
                size={22}
                fill={isActive && title === "Home" ? "currentColor" : "none"}
              />
              <span>{title}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
