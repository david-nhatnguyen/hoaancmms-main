import "@testing-library/jest-dom";

// Standard Test Environment Variables
process.env.VITE_API_URL = 'http://localhost:3000/api';
process.env.VITE_APP_NAME = 'CMMS-Test';
process.env.VITE_ENABLE_MOCK = 'false';

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
