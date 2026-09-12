import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

process.env.DATABASE_URL ??= "postgresql://test:test@127.0.0.1:5432/test";
process.env.AI_INTEGRATIONS_OPENAI_BASE_URL ??= "http://127.0.0.1:9/v1";
process.env.AI_INTEGRATIONS_OPENAI_API_KEY ??= "test-key";

const [
  { default: app },
  { openai },
  { GetExamInfoResponse, GetMockExamResponse, GetStudyGuideResponse },
] = await Promise.all([
  import("./app"),
  import("@workspace/integrations-openai-ai-server"),
  import("@workspace/api-zod"),
]);

const examInfo = {
  examName: "Real Estate License",
  state: "California",
  overview: "A licensing exam for candidates who want to practice real estate in California.",
  eligibilityRequirements: ["Complete the required coursework", "Submit a license application"],
  examFormat: {
    questionCount: 150,
    duration: "3 hours",
    sections: [
      {
        name: "National",
        description: "General real estate principles and practices",
        questionCount: 100,
      },
      {
        name: "State",
        description: "California-specific laws and regulations",
        questionCount: 50,
      },
    ],
  },
  passingScore: "70%",
  registrationProcess: ["Complete coursework", "Apply with the state", "Schedule the exam"],
  examDayTips: ["Arrive early", "Bring approved identification"],
  keyTopics: ["Contracts", "Agency", "Property ownership"],
  stateSpecificNotes: "California requires state-specific education and testing.",
};

const studyGuide = {
  examName: "Real Estate License",
  state: "California",
  studyPlan: "Review the core concepts first, then practice applying them to California-specific scenarios.",
  notes: [
    {
      title: "Agency relationships",
      content: "Understand the duties owed by each type of real estate agent.",
      importance: "high" as const,
    },
  ],
  flashcards: [
    {
      id: "card-1",
      front: "What is fiduciary duty?",
      back: "The duty to act in the client's best interest.",
      category: "Agency",
    },
  ],
  mnemonics: [
    {
      concept: "Fiduciary duties",
      mnemonic: "OLD CAR",
      explanation: "A way to remember the core duties owed to a client.",
    },
  ],
  recommendedResources: ["California licensing handbook"],
};

const mockExam = {
  examName: "Real Estate License",
  state: "California",
  timeLimit: 30,
  questions: [
    {
      id: "q1",
      question: "Which duty requires an agent to put the client's interests first?",
      options: ["A. Confidentiality", "B. Loyalty", "C. Accounting", "D. Disclosure"],
      category: "Agency",
    },
  ],
};

function completionFor(content: string) {
  return {
    choices: [{ message: { content } }],
  } as never;
}

describe("API exam generation contract", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = app.listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("reports a healthy API", async () => {
    const response = await fetch(`${baseUrl}/api/healthz`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("returns a structured exam-info response", async () => {
    vi.spyOn(openai.chat.completions, "create").mockResolvedValue(
      completionFor(JSON.stringify(examInfo)),
    );

    const response = await fetch(`${baseUrl}/api/exam/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examName: examInfo.examName, state: examInfo.state }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(GetExamInfoResponse.parse(body)).toEqual(examInfo);
  });

  it("rejects malformed AI output instead of returning it to clients", async () => {
    vi.spyOn(openai.chat.completions, "create").mockResolvedValue(
      completionFor(JSON.stringify({ examName: examInfo.examName })),
    );

    const response = await fetch(`${baseUrl}/api/exam/info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examName: examInfo.examName, state: examInfo.state }),
    });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "AI returned malformed exam information",
    });
  });

  it("returns a structured study-guide response", async () => {
    vi.spyOn(openai.chat.completions, "create").mockResolvedValue(
      completionFor(JSON.stringify(studyGuide)),
    );

    const response = await fetch(`${baseUrl}/api/exam/study-guide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examName: studyGuide.examName, state: studyGuide.state }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(GetStudyGuideResponse.parse(body)).toEqual(studyGuide);
  });

  it("rejects malformed study-guide output instead of returning it to clients", async () => {
    vi.spyOn(openai.chat.completions, "create").mockResolvedValue(
      completionFor(JSON.stringify({ examName: studyGuide.examName })),
    );

    const response = await fetch(`${baseUrl}/api/exam/study-guide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examName: studyGuide.examName, state: studyGuide.state }),
    });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "AI returned malformed study guide",
    });
  });

  it("returns a structured mock-exam response", async () => {
    vi.spyOn(openai.chat.completions, "create").mockResolvedValue(
      completionFor(JSON.stringify(mockExam)),
    );

    const response = await fetch(`${baseUrl}/api/exam/mock-exam`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examName: mockExam.examName, state: mockExam.state }),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(GetMockExamResponse.parse(body)).toEqual(mockExam);
  });

  it("rejects malformed mock-exam output instead of returning it to clients", async () => {
    vi.spyOn(openai.chat.completions, "create").mockResolvedValue(
      completionFor(JSON.stringify({ examName: mockExam.examName })),
    );

    const response = await fetch(`${baseUrl}/api/exam/mock-exam`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examName: mockExam.examName, state: mockExam.state }),
    });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "AI returned malformed mock exam",
    });
  });
});