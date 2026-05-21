"use client";

import { Search } from "lucide-react";
import { useEffect, useId, useRef, type KeyboardEvent } from "react";
import { useCoverSearch } from "../../hooks/toolbar/useCoverSearch";
import type { CanvasTile } from "../../lib/canvas/canvas-layout";
import { cn } from "../../lib/cn";

type ToolbarCoverSearchProps = {
  disabled?: boolean;
  onFocusTile: (tileId: string) => void;
  tiles: CanvasTile[];
};

export function ToolbarCoverSearch({
  disabled = false,
  onFocusTile,
  tiles,
}: ToolbarCoverSearchProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const search = useCoverSearch({ onFocusTile, tiles });

  const showPanel =
    search.isOpen && search.query.trim().length > 0 && !disabled;

  const matchSummary =
    search.matches.length > 0
      ? `${search.matches.length} match${search.matches.length === 1 ? "" : "es"}`
      : search.query.trim()
        ? "No matches"
        : null;

  useEffect(() => {
    if (!showPanel) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        rootRef.current?.contains(event.target)
      ) {
        return;
      }

      search.setIsOpen(false);
    }

    window.addEventListener("pointerdown", handlePointerDown, true);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, [search, showPanel]);

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      search.clearSearch();
      inputRef.current?.blur();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      search.focusNextMatch();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      search.focusPreviousMatch();
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      search.focusActiveMatchAndAdvance();
    }
  }

  return (
    <div
      className={cn(
        "toolbar-cover-search",
        disabled && "toolbar-cover-search-disabled",
      )}
      ref={rootRef}
    >
      <label className="sr-only" htmlFor={`${listboxId}-input`}>
        Find track on canvas
      </label>
      <div className="toolbar-cover-search-field">
        <Search
          aria-hidden="true"
          className="toolbar-cover-search-icon"
          size={14}
          strokeWidth={1.8}
        />
        <input
          aria-activedescendant={
            showPanel && search.listed[search.activeMatchIndex]
              ? `${listboxId}-option-${search.listed[search.activeMatchIndex]?.id}`
              : undefined
          }
          aria-controls={showPanel ? listboxId : undefined}
          aria-expanded={showPanel}
          autoComplete="off"
          className="toolbar-cover-search-input"
          disabled={disabled}
          id={`${listboxId}-input`}
          onChange={(event) => search.handleQueryChange(event.target.value)}
          onFocus={() => search.setIsOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder="Find track…"
          ref={inputRef}
          role="combobox"
          spellCheck={false}
          type="text"
          value={search.query}
        />
      </div>

      {showPanel ? (
        <div
          className="toolbar-cover-search-panel"
          id={listboxId}
          role="listbox"
        >
          {matchSummary ? (
            <p className="toolbar-cover-search-panel-meta font-control">
              {matchSummary}
              {search.matches.length > 0
                ? ` · ${search.activeMatchIndex + 1} of ${search.matches.length}`
                : null}
            </p>
          ) : null}

          {search.matches.length > 0 ? (
            <>
              <ul className="toolbar-cover-search-list">
                {search.listed.map((tile) => {
                  const isActive =
                    search.matches[search.activeMatchIndex]?.id === tile.id;

                  return (
                    <li key={tile.id}>
                      <button
                        aria-selected={isActive}
                        className={cn(
                          "toolbar-cover-search-option",
                          isActive && "toolbar-cover-search-option-active",
                        )}
                        id={`${listboxId}-option-${tile.id}`}
                        onClick={() => {
                          search.focusMatchAtIndex(
                            search.matches.findIndex(
                              (match) => match.id === tile.id,
                            ),
                          );
                          inputRef.current?.focus();
                        }}
                        role="option"
                        type="button"
                      >
                        <span className="toolbar-cover-search-option-title">
                          {tile.cover.title}
                        </span>
                        {tile.cover.artist ? (
                          <span className="toolbar-cover-search-option-artist">
                            {tile.cover.artist}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {search.overflowCount > 0 ? (
                <p className="font-control toolbar-cover-search-overflow">
                  +{search.overflowCount} more — press Enter to cycle
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
