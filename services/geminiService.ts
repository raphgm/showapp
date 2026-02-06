
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

export const analyzeCode = async (code: string) => {
  try {
    const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a virtual execution of this code and explain its purpose and any potential issues: \n\n ${code}`,
      config: {
        systemInstruction: "You are an expert software instructor. Provide a brief 'Terminal Output' simulation followed by a 'Logic Explanation'."
      }
    }));
    return response.text;
  } catch (error) {
    return "Failed to analyze code segment.";
  }
};

export const generateCourseSyllabus = async (topic: string) => {
  try {
    const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a 4-module educational syllabus for a course about: ${topic}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  objectives: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          },
          required: ["title", "description", "modules"]
        }
      }
    }));
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return null;
  }
};

export const generateVideoInsights = async (imageBuffer: string, prompt: string) => {
  try {
    const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBuffer.split(',')[1],
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            summary: { type: Type.STRING },
            transcript: { type: Type.STRING },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  label: { type: Type.STRING }
                }
              }
            }
          },
          required: ["suggestedTitle", "summary"]
        }
      }
    }));

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const generateKnowledgeCheck = async (transcript: string) => {
  try {
    const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this transcript, generate 3 multiple-choice questions to test understanding: \n\n ${transcript}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.NUMBER },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctIndex"]
          }
        }
      }
    }));
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};

export const transmuteAsset = async (transcript: string, format: 'short' | 'linkedin' | 'documentation') => {
  const prompts = {
    short: "Create a 30-second high-energy script for a TikTok/Reel based on the best part of this content. Use hooks and fast pacing.",
    linkedin: "Write a professional, authoritative LinkedIn post summarizing these insights to drive engagement from industry peers.",
    documentation: "Transform this video transcript into a clean, structured technical documentation page with clear headings, bullet points, and a summary."
  };

  try {
    const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Context: ${transcript}\n\nTask: ${prompts[format]}`,
    }));
    return response.text;
  } catch (error) {
    return "Transmutation interrupted. Please recalibrate Genius Core.";
  }
};

export const askAiGenius = async (videoContext: string, question: string) => {
  try {
    const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Video Context: ${videoContext}\n\nUser Question: ${question}`,
      config: {
        systemInstruction: "You are the 'Show Genius', an expert educational assistant. Answer questions specifically about the provided video content. Be concise and helpful."
      }
    }));
    return response.text;
  } catch (error) {
    console.error("Genius Error:", error);
    return "I'm having trouble analyzing that right now.";
  }
};
