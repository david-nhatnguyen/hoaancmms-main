export default {
  displayName: 'web',
  testEnvironment: 'jsdom',
  transform: {
    // Sử dụng @swc/jest để compile TypeScript/JSX cực nhanh (thay vì ts-jest)
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
      jsc: {
        transform: {
          react: {
            runtime: 'automatic',
          },
        },
      },
    }],
  },
  moduleNameMapper: {
    // Xử lý alias @/ tương tự như trong vite.config.ts và tsconfig.json
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock các file style để tránh lỗi parse CSS
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  // Sử dụng <rootDir> thay vì path.resolve để tránh lỗi import.meta trong môi trường TS CommonJS
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  // Chỉ chạy các file có đuôi .test.ts hoặc .test.tsx nằm trong thư mục src
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx}',
  ],
};