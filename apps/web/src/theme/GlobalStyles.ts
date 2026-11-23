import { createGlobalStyle } from "styled-components";

export const GlobalStyles = createGlobalStyle`
  /* Fallback specifically for Unicode Bangladeshi Taka symbol (৳) */
  @font-face {
    font-family: 'Plus Jakarta Sans';
    src: local('Noto Sans Bengali'), local('Hind Siliguri'), local('Kalpurush');
    font-weight: 400 800;
    font-style: normal;
    unicode-range: U+09F2-09F3;
  }

  @font-face {
    font-family: 'JetBrains Mono';
    src: local('Noto Sans Bengali'), local('Hind Siliguri'), local('Kalpurush');
    font-weight: 400 800;
    font-style: normal;
    unicode-range: U+09F2-09F3;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    height: 100%;
    font-family: ${({ theme }) => theme.typography.fontFamily.sans};
    background-color: ${({ theme }) => theme.colors.backgroundApp};
    color: ${({ theme }) => theme.colors.textPrimary};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  button {
    font-family: inherit;
  }

  input, select, textarea {
    font-family: inherit;
  }

  /* ------------------------------------------------------------- */
  /* PRINT STYLES: Clean 1-page receipt printing                   */
  /* ------------------------------------------------------------- */
  @page {
    size: auto;
    margin: 10mm;
  }

  @media print {
    /* Hide the entire React root app when printing a receipt */
    body.printing-receipt #root,
    body:has(#printable-receipt) #root {
      display: none;
    }

    body {
      background: ${({ theme }) => theme.colors.background};
      color: ${({ theme }) => theme.colors.textPrimary};
      margin: 0;
      padding: 0;
      height: auto;
      min-height: 0;
      overflow: visible;
    }

    /* Print color accuracy */
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Hide buttons and no-print helpers */
    .no-print,
    button {
      display: none;
    }
  }
`;
