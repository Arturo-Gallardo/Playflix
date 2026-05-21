"use client";

import { LogOut, User } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SpotifyUserProfile } from "../../types/spotify-auth";
import { ToolbarPressButton } from "./ToolbarPressButton";

type MenuPosition = {
  left: number;
  top: number;
};

type ToolbarAccountMenuProps = {
  onSignOut: () => void;
  user: SpotifyUserProfile;
};

export function ToolbarAccountMenu({ onSignOut, user }: ToolbarAccountMenuProps) {
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({
    left: 0,
    top: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    function updateMenuPosition() {
      const buttonElement = buttonRef.current;

      if (!buttonElement) {
        return;
      }

      const rect = buttonElement.getBoundingClientRect();
      const menuElement = menuRef.current;
      const menuWidth = menuElement?.offsetWidth ?? 200;
      const padding = 8;
      const left = Math.min(
        Math.max(padding, rect.right - menuWidth),
        window.innerWidth - menuWidth - padding,
      );

      setMenuPosition({
        left,
        top: rect.bottom + 8,
      });
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);

    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      if (
        buttonRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleSignOut() {
    setIsOpen(false);
    onSignOut();
  }

  return (
    <>
      <ToolbarPressButton
        aria-controls={isOpen ? menuId : undefined}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`account menu for ${user.displayName}`}
        className="toolbar-avatar-button"
        onClick={() => setIsOpen((current) => !current)}
        ref={buttonRef}
        variant="icon"
      >
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="toolbar-avatar-image"
            height={36}
            src={user.imageUrl}
            width={36}
          />
        ) : (
          <span className="toolbar-avatar-fallback">
            <User aria-hidden="true" className="size-4" strokeWidth={1.8} />
          </span>
        )}
      </ToolbarPressButton>

      {isMounted && isOpen
        ? createPortal(
            <div
              aria-labelledby={`${menuId}-label`}
              className="toolbar-account-menu font-control"
              id={menuId}
              ref={menuRef}
              role="menu"
              style={{
                left: `${menuPosition.left}px`,
                top: `${menuPosition.top}px`,
              }}
            >
              <div className="toolbar-account-menu-header" id={`${menuId}-label`}>
                {user.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    className="toolbar-account-menu-avatar"
                    height={32}
                    src={user.imageUrl}
                    width={32}
                  />
                ) : (
                  <span className="toolbar-account-menu-avatar-fallback">
                    {user.displayName.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {user.displayName}
                  </p>
                  <p className="text-[10px] text-white/45">Spotify account</p>
                </div>
              </div>

              <button
                className="toolbar-account-menu-item"
                onClick={handleSignOut}
                role="menuitem"
                type="button"
              >
                <LogOut aria-hidden="true" className="size-3.5" strokeWidth={2} />
                <span>Sign out</span>
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
