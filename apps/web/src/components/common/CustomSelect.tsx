import React, { useState, useRef, useEffect, type ReactNode } from "react";
import { Check } from "lucide-react";
import { ChevronDownIcon } from "@/icons";
import { KEYBOARD_KEYS, DOM_EVENTS } from "@/utils/constants";
import {
  SelectContainer,
  SelectTrigger,
  TriggerLeft,
  ChevronWrap,
  DropdownMenu,
  OptionItem,
  OptionLabel,
  StatusDot,
} from "./CustomSelect.styles";

export interface SelectOption {
  value: string;
  label: string;
  dotColor?: string;
  badge?: string;
}

export interface CustomSelectProps {
  options: readonly SelectOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  placeholder?: string;
  minWidth?: string;
  fullWidth?: boolean;
  align?: "left" | "right";
  ariaLabel?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  icon,
  placeholder = "Select option",
  minWidth,
  fullWidth = false,
  align = "left",
  ariaLabel,
  id,
  name,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ESCAPE) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener(DOM_EVENTS.MOUSEDOWN, handleClickOutside);
      document.addEventListener(DOM_EVENTS.KEYDOWN, handleKeyDown);
    }

    return () => {
      document.removeEventListener(DOM_EVENTS.MOUSEDOWN, handleClickOutside);
      document.removeEventListener(DOM_EVENTS.KEYDOWN, handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <SelectContainer
      ref={containerRef}
      $minWidth={minWidth}
      $fullWidth={fullWidth}
    >
      <SelectTrigger
        id={id}
        name={name}
        type="button"
        disabled={disabled}
        $isOpen={isOpen}
        $fullWidth={fullWidth}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
      >
        <TriggerLeft>
          {icon}
          {selectedOption?.dotColor && (
            <StatusDot $color={selectedOption.dotColor} />
          )}
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
        </TriggerLeft>
        <ChevronWrap $isOpen={isOpen}>
          <ChevronDownIcon size={14} />
        </ChevronWrap>
      </SelectTrigger>

      {isOpen && (
        <DropdownMenu $align={align} $fullWidth={fullWidth} role="listbox">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <OptionItem
                key={option.value}
                $isSelected={isSelected}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={isSelected}
              >
                <OptionLabel>
                  {option.dotColor && <StatusDot $color={option.dotColor} />}
                  <span>{option.label}</span>
                </OptionLabel>
                {isSelected && <Check size={14} color="currentColor" />}
              </OptionItem>
            );
          })}
        </DropdownMenu>
      )}
    </SelectContainer>
  );
};
