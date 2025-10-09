// RootLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

function ScrollToHash() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const sel = hash.startsWith("#") ? hash : `#${hash}`;
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (el.tabIndex === -1) el.focus({ preventScroll: true });
  }, [pathname, hash]);
  return null;
}

export function RootLayout() {
  return (
    <>
      {/* header */}
      <ScrollToHash />
      <Outlet />
      {/* footer */}
    </>
  );
}
