import { useEffect, useState } from "react";
import { useUserPreferences } from "@/contexts/UserPreferencesContext";

const CursorFollower = () => {
  const { preferences } = useUserPreferences();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // Don't set up listeners if disabled in preferences
    if (!preferences.appearance.showCursorFollower) return;

    // Check if device has a mouse (not touch-only)
    const hasPointer = window.matchMedia("(pointer: fine)").matches;
    if (!hasPointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("input");

      setIsHovering(!!isInteractive);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [preferences.appearance.showCursorFollower]);

  // Don't render if disabled in preferences
  if (!preferences.appearance.showCursorFollower) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: isHovering ? "60px" : "40px",
        height: isHovering ? "60px" : "40px",
        borderRadius: "50%",
        backgroundColor: "white",
        mixBlendMode: "difference",
        pointerEvents: "none",
        zIndex: 9999,
        transform: `translate(${position.x - (isHovering ? 30 : 20)}px, ${
          position.y - (isHovering ? 30 : 20)
        }px)`,
        transition: "all 0.2s cubic-bezier(0.22, 0.61, 0.36, 1)",
        opacity: position.x === 0 && position.y === 0 ? 0 : 1,
      }}
    />
  );
};

export default CursorFollower;
