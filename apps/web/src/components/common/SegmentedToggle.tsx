import {
  SegmentedContainer,
  SlidingIndicator,
  SegmentButton,
} from "./SegmentedToggle.styles";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedToggleProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  size?: "sm" | "md";
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel = "Filter selection",
  size = "md",
}: SegmentedToggleProps<T>) {
  const activeIndex = Math.max(
    0,
    options.findIndex((opt) => opt.value === value),
  );

  return (
    <SegmentedContainer
      role="group"
      aria-label={ariaLabel}
      $total={options.length}
      $size={size}
    >
      <SlidingIndicator $activeIndex={activeIndex} $total={options.length} />
      {options.map((option) => (
        <SegmentButton
          key={option.value}
          type="button"
          $isActive={option.value === value}
          $size={size}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </SegmentButton>
      ))}
    </SegmentedContainer>
  );
}
