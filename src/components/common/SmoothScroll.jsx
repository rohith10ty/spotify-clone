import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function SmoothScroll({ children }) {
  const location = useLocation();

  useEffect(() => {
    // Reset scroll position on route change
    const scrollContainers = document.querySelectorAll(".spotify-page, .spotify-scrollbar");
    scrollContainers.forEach((el) => {
      el.scrollTo({ top: 0, behavior: "instant" });
    });
  }, [location.pathname]);

  return children;
}
