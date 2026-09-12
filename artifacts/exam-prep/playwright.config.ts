import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://127.0.0.1:25513",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command:
      "PORT=25513 BASE_PATH=/ NODE_ENV=test pnpm --filter @workspace/exam-prep run dev",
    url: "http://127.0.0.1:25513/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});