import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { HumanizeTextBody } from "@workspace/api-zod";

const router = Router();

router.post("/humanize", async (req, res) => {
  const parsed = HumanizeTextBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { text, writingType } = parsed.data;

  const systemPrompt = `You are a skilled human editor and creative writing expert who specializes in transforming AI-generated text into authentic human writing. You understand the subtle differences between AI and human voice — real humans use contractions, break rules, show vulnerability, get specific and personal, use unexpected comparisons, have quirks and inconsistencies, and write with genuine emotion. You preserve the core meaning and intent while making the writing feel genuinely human.`;

  const userPrompt = `Rewrite the following ${writingType} so it sounds authentically human. Do NOT make it worse or less coherent — make it better AND more human.

ORIGINAL TEXT:
"""
${text}
"""

Humanization strategies (apply what is appropriate for this ${writingType}):
- Vary sentence length dramatically — mix very short with longer ones
- Use contractions naturally
- Add specific, concrete details instead of vague generalities
- Replace clichéd metaphors with unexpected, personal-feeling ones
- Break grammatical rules intentionally where a human might (starting with "And", "But", comma splices for effect)
- Include moments of uncertainty or self-correction where natural
- Use colloquialisms or informal phrasing appropriate to the genre
- For poems: prioritize emotional rawness, unexpected line breaks, imperfect rhymes over perfect ones
- For essays: add a personal perspective or concession
- For academic: reduce hedging boilerplate, add genuine insight

Return a JSON object with EXACTLY this structure (no markdown, just raw JSON):
{
  "humanizedText": "<the fully rewritten text — preserve any line breaks if it's a poem>",
  "changesExplained": [
    "<specific change 1 and why it humanizes: e.g. 'Broke the uniform sentence rhythm by adding a one-word sentence for punch'>",
    "<specific change 2>",
    ...at least 4 changes
  ]
}`;

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
    req.log.error({ err }, "Failed to humanize text");
    res.status(500).json({ error: "Failed to humanize text" });
  }
});

export default router;
