import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['convex/tests/**/*.test.ts'],
    exclude: [],
    server: {
      deps: {
        inline: ['convex-test'],
      },
    },
  },
});
