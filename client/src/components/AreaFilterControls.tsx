import { LayoutGrid, Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { convertAreaInput, type AreaUnit } from "@/lib/areaSearch";

export type AreaViewMode = "cards" | "table";

interface AreaFilterControlsProps {
  unit: AreaUnit;
  onUnitChange: (unit: AreaUnit) => void;
  min: string;
  max: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  viewMode?: AreaViewMode;
  onViewModeChange?: (mode: AreaViewMode) => void;
  compact?: boolean;
}

export default function AreaFilterControls({
  unit,
  onUnitChange,
  min,
  max,
  onMinChange,
  onMaxChange,
  viewMode,
  onViewModeChange,
  compact = false,
}: AreaFilterControlsProps) {
  const changeUnit = (next: AreaUnit) => {
    if (next === unit) return;
    onMinChange(convertAreaInput(min, unit, next));
    onMaxChange(convertAreaInput(max, unit, next));
    onUnitChange(next);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex rounded-md border border-border bg-card p-0.5">
        <Button
          type="button"
          variant={unit === "sqm" ? "default" : "ghost"}
          size="sm"
          className="h-7 px-2.5 text-xs"
          onClick={() => changeUnit("sqm")}
        >
          m²
        </Button>
        <Button
          type="button"
          variant={unit === "sqft" ? "default" : "ghost"}
          size="sm"
          className="h-7 px-2.5 text-xs"
          onClick={() => changeUnit("sqft")}
        >
          sqft
        </Button>
      </div>
      <Input
        type="number"
        min="0"
        inputMode="decimal"
        value={min}
        onChange={(event) => onMinChange(event.target.value)}
        placeholder={`Min ${unit === "sqm" ? "m²" : "sqft"}`}
        className={compact ? "h-8 w-24 text-xs" : "h-9 w-28 text-xs"}
        aria-label={`Minimum land area in ${unit}`}
      />
      <Input
        type="number"
        min="0"
        inputMode="decimal"
        value={max}
        onChange={(event) => onMaxChange(event.target.value)}
        placeholder={`Max ${unit === "sqm" ? "m²" : "sqft"}`}
        className={compact ? "h-8 w-24 text-xs" : "h-9 w-28 text-xs"}
        aria-label={`Maximum land area in ${unit}`}
      />
      {viewMode && onViewModeChange && (
        <div className="inline-flex rounded-md border border-border bg-card p-0.5">
          <Button
            type="button"
            variant={viewMode === "cards" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => onViewModeChange("cards")}
          >
            <LayoutGrid className="h-3.5 w-3.5" /> Cards
          </Button>
          <Button
            type="button"
            variant={viewMode === "table" ? "default" : "ghost"}
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onClick={() => onViewModeChange("table")}
          >
            <Table2 className="h-3.5 w-3.5" /> Table
          </Button>
        </div>
      )}
    </div>
  );
}
