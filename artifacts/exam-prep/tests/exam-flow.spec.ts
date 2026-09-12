import { expect, test } from "@playwright/test";

test("entering an exam reaches the generated overview", async ({ page }) => {
  await page.route("**/api/exam/info", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        examName: "Real Estate License",
        state: "California",
        overview: "A generated overview for California real estate candidates.",
        eligibilityRequirements: ["Complete the required coursework"],
        examFormat: {
          questionCount: 150,
          duration: "3 hours",
          sections: [
            {
              name: "National",
              description: "General real estate principles",
              questionCount: 100,
            },
          ],
        },
        passingScore: "70%",
        registrationProcess: ["Submit an application"],
        examDayTips: ["Arrive early"],
        keyTopics: ["Contracts"],
        stateSpecificNotes: "California-specific requirements apply.",
      }),
    });
  });

  await page.goto("/");
  await page.getByPlaceholder("e.g., Real Estate License").fill("Real Estate License");
  await page.getByPlaceholder("e.g., California").fill("California");
  await page.getByRole("button", { name: "Start Studying" }).click();

  await expect(page).toHaveURL(/\/exam-info$/);
  await expect(
    page.getByRole("heading", { name: "Real Estate License (California)" }),
  ).toBeVisible();
  await expect(
    page.getByText("A generated overview for California real estate candidates."),
  ).toBeVisible();
});