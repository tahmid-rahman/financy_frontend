import { useState, useRef, useEffect } from "react";
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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownWidth, setDropdownWidth] = useState("auto");

  // Calculate the maximum width needed based on all options
  useEffect(() => {
    if (buttonRef.current) {
      // Temporarily render all options to measure their width
      const tempSpan = document.createElement("span");
      tempSpan.style.visibility = "hidden";
      tempSpan.style.whiteSpace = "nowrap";
      tempSpan.style.position = "absolute";
      tempSpan.style.padding = "0.5rem 1rem"; // Match your button's padding
      document.body.appendChild(tempSpan);

      let maxWidth = 0;
      options.forEach((option) => {
        tempSpan.textContent = option;
        maxWidth = Math.max(maxWidth, tempSpan.offsetWidth);
      });

      // Also measure the current button width (with icon)
      tempSpan.textContent = activeOption;
      const buttonWidth = tempSpan.offsetWidth + 24; // Add space for the icon

      // Use the larger of the two widths
      setDropdownWidth(`${Math.max(maxWidth, buttonWidth)}px`);

      document.body.removeChild(tempSpan);
    }
  }, [options, activeOption]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-background border border-border/50 rounded-lg hover:border-primary transition-colors"
      >
        <span>{activeOption}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="absolute z-10 mt-1 bg-surface border border-border/50 rounded-lg shadow-lg"
          style={{ width: dropdownWidth, minWidth: "100%" }}
        >
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
