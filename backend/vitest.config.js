import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    setupFiles: ["./tests/helpers/setup.js"],
    // Each test file boots its own in-memory Mongo replica set; running files
    // sequentially keeps memory use flat on small CI runners.
    fileParallelism: false,
    hookTimeout: 120000,
    testTimeout: 30000,
    coverage: {
      provider: "v8",
      include: [
        "app.js",
        "controllers/**",
        "middleware/**",
        "models/**",
        "routes/**",
      ],
      // Thresholds are a floor so coverage can only ratchet up; raise them as
      // more suites land.
      thresholds: {
        lines: 40,
        functions: 28,
        statements: 40,
        branches: 34,
      },
    },
  },
});
