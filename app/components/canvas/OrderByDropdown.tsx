"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { TileOrderCriterion } from "../../lib/canvas/tile-ordering";
import { cn } from "../../lib/cn";

const orderOptions: Array<{ criterion: TileOrderCriterion; label: string }> = [
  { criterion: "artist", label: "Artist" },
  { criterion: "color", label: "Color" },
  { criterion: "dateAdded", label: "Date added" },
  { criterion: "dateReleased", label: "Date released" },
  { criterion: "tempo", label: "Tempo" },
  { criterion: "popularity", label: "Popularity" },
];

type OrderByDropdownProps = {
  canOrder: boolean;
  itemClassName: string;
  onClose: () => void;
  onOrderBy: (criterion: TileOrderCriterion) => void;
};

export function OrderByDropdown({
  canOrder,
  itemClassName,
  onClose,
  onOrderBy,
}: OrderByDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(itemClassName, "justify-between", !canOrder && "text-white/30")}
        disabled={!canOrder}
        onClick={(event) => {
          event.stopPropagation();

          if (canOrder) {
            setIsOpen((current) => !current);
          }
        }}
        type="button"
      >
        <span>Order by</span>
        <ChevronDown
          className={cn(
            "size-3 shrink-0 text-white/50 transition-transform duration-150",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && canOrder ? (
        <div className="order-by-dropdown-panel">
          <div
            className="order-by-dropdown-scroll"
            onWheel={(event) => {
              event.stopPropagation();
            }}
            role="listbox"
          >
            {orderOptions.map((option) => (
              <button
                key={option.criterion}
                className={itemClassName}
                onClick={(event) => {
                  event.stopPropagation();
                  onOrderBy(option.criterion);
                  onClose();
                }}
                role="option"
                type="button"
              >
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
