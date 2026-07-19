import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GetMockExamBody, SubmitMockExamBody } from "@workspace/api-zod";

const router = Router();

router.post("/mock-exam", async (req, res) => {
  const parsed = GetMockExamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { examName, state, questionCount = 20 } = parsed.data;
  const today = new Date().toISOString().split("T")[0];
  const count = Math.min(Math.max(questionCount, 5), 50);

  const systemPrompt = `You are an expert exam writer who creates realistic, high-quality practice questions for professional licensing and certification exams. Today's date is ${today}. Your questions should accurately reflect the difficulty and style of the real exam.`;

  const userPrompt = `Create a realistic practice exam for the "${examName}" in ${state} with exactly ${count} multiple choice questions.

Return a JSON object with EXACTLY this structure (no markdown, just raw JSON):
{
  "examName": "${examName}",
  "state": "${state}",
  "timeLimit": <suggested time in minutes as an integer>,
  "questions": [
    {
      "id": "q1",
      "question": "The full question text",
      "options": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
      "category": "The exam section or topic this question belongs to"
    }
  ]
}

Requirements:
- Each question must have exactly 4 options labeled A, B, C, D
- Questions should span all major topic areas of the ${examName}
- Include questions of varying difficulty (easy, medium, hard)
- Questions should be realistic and reflect the style of the actual exam
- Make questions specific to ${state} regulations and requirements where applicable
- Do NOT include the correct answer in this response — that comes when the exam is submitted
- Questions should be clear, unambiguous, and professionally written
- Question IDs should be "q1", "q2", "q3", etc.`;

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
    req.log.error({ err }, "Failed to generate mock exam");
    res.status(500).json({ error: "Failed to generate mock exam" });
  }
});

router.post("/mock-exam/submit", async (req, res) => {
  const parsed = SubmitMockExamBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const { examName, state, questions, answers } = parsed.data;
  const today = new Date().toISOString().split("T")[0];

  const questionsText = questions.map((q) => {
    const userAnswer = answers.find((a) => a.questionId === q.id);
    return `Q${q.id}: ${q.question}\nOptions: ${q.options.join(" | ")}\nUser answered: ${userAnswer?.selectedAnswer ?? "No answer"}`;
  }).join("\n\n");

  const systemPrompt = `You are an expert exam grader for professional licensing exams. Today's date is ${today}. Grade each question accurately and provide clear, educational explanations for both correct and incorrect answers.`;

  const userPrompt = `Grade this practice ${examName} exam for ${state} and provide detailed feedback.

Questions and user answers:
${questionsText}

Return a JSON object with EXACTLY this structure (no markdown, just raw JSON):
{
  "examName": "${examName}",
  "state": "${state}",
  "score": <percentage score as a number 0-100>,
  "passed": <true if score meets typical passing threshold for this exam, false otherwise>,
  "totalQuestions": ${questions.length},
  "correctAnswers": <number of correct answers>,
  "feedback": [
    {
      "questionId": "q1",
      "correct": <true or false>,
      "correctAnswer": "A" | "B" | "C" | "D",
      "yourAnswer": "A" | "B" | "C" | "D",
      "explanation": "Clear explanation of why the correct answer is right, and if the user was wrong, why their answer was incorrect. Be educational and specific."
    }
  ],
  "studyRecommendations": ["Specific recommendation based on wrong answers", ...]
}

Requirements:
- Grade each question accurately using your knowledge of the ${examName} in ${state}
- The "passed" field should use the typical passing score for this exam (usually 70-75% for most professional exams)
- Explanations should be 1-3 sentences, educational, and reference the relevant regulation or concept
- "correctAnswer" and "yourAnswer" must be just the letter (A, B, C, or D) without punctuation
- studyRecommendations should be 3-5 specific areas to review based on wrong answers`;

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
    req.log.error({ err }, "Failed to grade mock exam");
    res.status(500).json({ error: "Failed to grade exam" });
  }
});

export default router;
