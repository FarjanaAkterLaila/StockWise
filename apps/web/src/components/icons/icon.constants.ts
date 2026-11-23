export const getChevronDownDataUri = (
  colorHex: string = "%2364748b",
  strokeWidth: number = 2.2,
) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='${colorHex}' stroke-width='${strokeWidth}' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E`;

export const CHEVRON_DOWN_SVG_MUTED = getChevronDownDataUri("%2364748b", 2.2);
export const CHEVRON_DOWN_SVG_PRIMARY = getChevronDownDataUri("%234f46e5", 2.5);
