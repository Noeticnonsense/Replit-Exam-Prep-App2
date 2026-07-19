import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GetStudyGuideBody } from "@workspace/api-zod";

const router = Router();

router.post("/study-guide", async (req, res) => {
  const parsed = GetStudyGuideBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { examName, state } = parsed.data;
  const today = new Date().toISOString().split("T")[0];

  const systemPrompt = `You are an expert exam preparation tutor specializing in helping candidates pass professional licensing and certification exams. Today's date is ${today}. You create highly effective, memorable study materials tailored to specific exams and states.`;

  const userPrompt = `Create a comprehensive study guide for the "${examName}" exam in ${state}.

Return a JSON object with EXACTLY this structure (no markdown, just raw JSON):
{
  "examName": "${examName}",
  "state": "${state}",
  "studyPlan": "A detailed recommended study approach and timeline (3-4 sentences describing how to approach studying)",
  "notes": [
    {
      "title": "Topic title",
      "content": "Detailed explanation of the concept, including key facts and what to know for the exam",
      "importance": "high" | "medium" | "low"
    }
  ],
  "flashcards": [
    {
      "id": "card-1",
      "front": "Question or term",
      "back": "Answer or definition",
      "category": "category name"
    }
  ],
  "mnemonics": [
    {
      "concept": "The concept or list being memorized",
      "mnemonic": "The mnemonic device (acronym, rhyme, phrase, story, etc.)",
      "explanation": "How the mnemonic maps to the concept"
    }
  ],
  "recommendedResources": ["Resource 1", "Resource 2", ...]
}

Requirements:
- Include at least 8 study notes covering the major topics of the exam (mix of high, medium, and low importance)
- Create at least 20 flashcards covering key terms, concepts, formulas, and processes
- Create at least 6 memorable mnemonics for complex lists, rules, or sequences
- Make everything specific to ${state} where relevant
- Flashcard categories should match the major sections of the exam
- Mnemonics should be genuinely memorable and practical`;

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
    req.log.error({ err }, "Failed to generate study guide");
    res.status(500).json({ error: "Failed to generate study guide" });
  }
});

export default router;
