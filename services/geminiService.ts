
// @google/genai used to perform skill analysis, study plan generation, and interview prep
import { GoogleGenAI, Type } from "@google/genai";
import { SkillAnalysis, StudyPlanItem, InterviewQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeJsonParse = <T>(text: string, fallback: T): T => {
  try {
    const cleanJson = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson) as T;
  } catch (e) {
    console.error("JSON Parse Error:", e, "Original text:", text);
    return fallback;
  }
};

// Fix: Added missing export for extractTextFromPdf used in Analysis.tsx
export const extractTextFromPdf = async (base64: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64,
          },
        },
        { text: "Extract all text from this document. Provide only the text without any summary or commentary." },
      ],
    },
  });
  return response.text || "";
};

// Use gemini-3-pro-preview for complex reasoning task: Skill Profiling
export const extractAndAnalyzeSkills = async (input: string): Promise<SkillAnalysis> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Analyze the following user skills or resume text: "${input.substring(0, 20000)}". 
    Extract normalized skills, predict the most suitable job role, identify which of their skills match that role perfectly, which are missing, and which are irrelevant to that specific role.`,
    config: {
      thinkingConfig: { thinkingBudget: 4096 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          predictedRole: { type: Type.STRING },
          matchPercentage: { type: Type.NUMBER },
          matchingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
          irrelevantSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["detectedSkills", "predictedRole", "matchPercentage", "matchingSkills", "missingSkills", "irrelevantSkills"],
      },
    },
  });

  return safeJsonParse<SkillAnalysis>(response.text || "{}", {
    detectedSkills: [],
    predictedRole: "Unknown",
    matchPercentage: 0,
    matchingSkills: [],
    missingSkills: [],
    irrelevantSkills: []
  });
};

// Use gemini-3-pro-preview for complex reasoning task: Personalized Study Planning
export const generateStudyPlan = async (missingSkills: string[], role: string): Promise<StudyPlanItem[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Based on these missing skills: [${missingSkills.join(", ")}] for the role of "${role}", create a personalized study plan. 
    Include estimated learning time, difficulty level, descriptions, and 2 high-quality learning resource links for each skill.`,
    config: {
      thinkingConfig: { thinkingBudget: 4096 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            skill: { type: Type.STRING },
            estimatedTime: { type: Type.STRING },
            difficulty: { type: Type.STRING },
            resources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                },
                required: ["title", "url"]
              },
            },
            description: { type: Type.STRING },
          },
          required: ["skill", "estimatedTime", "difficulty", "resources", "description"],
          propertyOrdering: ["skill", "description", "difficulty", "estimatedTime", "resources"]
        },
      },
    },
  });

  return safeJsonParse<StudyPlanItem[]>(response.text || "[]", []);
};

// Use gemini-3-pro-preview for complex reasoning task: Interview Question Generation
export const getInterviewPrep = async (role: string, skills: string[]): Promise<InterviewQuestion[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Act as a senior hiring manager. From your internal database of 1000+ industry-standard interview questions, pull a diverse batch of 15 questions for the role: "${role}" and skills: [${skills.join(", ")}]. 
    Ensure a mix of: Technical (5), HR (3), Aptitude (2), Coding (3), and System Design (2). 
    Provide comprehensive, high-quality answers and professional tips for each.`,
    config: {
      thinkingConfig: { thinkingBudget: 4096 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING },
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            tips: { type: Type.STRING },
          },
          required: ["id", "category", "question", "answer", "tips"]
        },
      },
    },
  });

  return safeJsonParse<InterviewQuestion[]>(response.text || "[]", []);
};

// Fix: Pass history to the chat session for continuity
export const getCareerAssistantResponse = async (history: { role: string; text: string }[], message: string) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    history: history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    })),
    config: {
      systemInstruction: "You are SkillGraph AI Career Assistant. You help users with career advice, study strategies, and resume optimization based on their current skills and predicted roles. Keep answers concise and helpful.",
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text;
};
