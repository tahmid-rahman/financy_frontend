import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function FilterDropdown({
  options,
  activeOption,
  onSelect,
}: {
  options: string[];
  activeOption: string;
  onSelect: (option: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-background border border-border/50 rounded-lg hover:border-primary transition-colors"
      >
        <span>{activeOption}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-surface border border-border/50 rounded-lg shadow-lg">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 hover:bg-background transition-colors ${
                option === activeOption ? "text-primary" : "text-text"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
