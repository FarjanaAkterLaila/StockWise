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
`;
