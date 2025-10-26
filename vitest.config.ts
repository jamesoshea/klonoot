import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  plugins: [react()],
  test: {
    projects: [
      {
        test: {
          name: "component",
          include: ["**/*.test.browser.tsx"],
          browser: {
            provider: playwright(),
            enabled: true,
            // at least one instance is required
            instances: [{ browser: "chromium" }],
          },
        },
      },
      {
        test: {
          include: ["**/*.test.ts"],
          name: "unit",
          environment: "node",
        },
      },
    ],
  },
});
