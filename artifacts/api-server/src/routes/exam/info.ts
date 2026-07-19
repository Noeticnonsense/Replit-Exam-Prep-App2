import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GetExamInfoBody } from "@workspace/api-zod";

const router = Router();

router.post("/info", async (req, res) => {
  const parsed = GetExamInfoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { examName, state } = parsed.data;
  const today = new Date().toISOString().split("T")[0];

  const systemPrompt = `You are an expert exam preparation advisor with up-to-date knowledge of professional licensing and certification exams across the United States. Today's date is ${today}. Provide accurate, state-specific information about exams based on current requirements.`;

  const userPrompt = `Provide detailed, accurate information about the "${examName}" exam for a candidate planning to take it in ${state}.

Return a JSON object with EXACTLY this structure (no markdown, just raw JSON):
{
  "examName": "${examName}",
  "state": "${state}",
  "overview": "2-3 sentence overview of what this exam is, who needs it, and why it matters",
  "eligibilityRequirements": ["requirement 1", "requirement 2", ...],
  "examFormat": {
    "questionCount": <number or null>,
    "duration": "<duration string or null>",
    "sections": [
      { "name": "section name", "description": "what it covers", "questionCount": <number or null> }
    ]
  },
  "passingScore": "description of passing requirement",
  "registrationProcess": ["step 1", "step 2", ...],
  "examDayTips": ["tip 1", "tip 2", ...],
  "keyTopics": ["topic 1", "topic 2", ...],
  "stateSpecificNotes": "State-specific rules, variations, or additional requirements for ${state}"
}

Be specific to ${state} regulations and requirements. Include at least 4 eligibility requirements, 4 registration steps, 5 exam day tips, 6 key topics, and all major sections of the exam.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-terra",
      max_completion_tokens: 8192,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    const data = JSON.parse(content);
    res.json(data);
  } catch (err) {
    req.log.error({ err }, "Failed to generate exam info");
    res.status(500).json({ error: "Failed to generate exam information" });
  }
});

export default router;
