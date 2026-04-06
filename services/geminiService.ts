
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getAiClient = () => {
  const apiKey = localStorage.getItem('gemini_api_key') || process.env.API_KEY;
  return new GoogleGenAI({ apiKey: apiKey || "" });
};

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
  const ai = getAiClient();
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
  const ai = getAiClient();
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

export const generateVideoInsightsFromFrames = async (imageBuffers: string[], prompt: string) => {
  const ai = getAiClient();
  try {
    const imageParts = imageBuffers.map(buffer => ({
      inlineData: {
        mimeType: 'image/jpeg',
        data: buffer.split(',')[1],
      },
    }));

    const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          ...imageParts,
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
          required: ["suggestedTitle", "summary", "transcript"]
        }
      }
    }));

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const editImageWithAi = async (base64ImageData: string, prompt: string): Promise<string | null> => {
  const ai = getAiClient();
  try {
    const mimeType = base64ImageData.substring(5, base64ImageData.indexOf(';'));
    const data = base64ImageData.split(',')[1];

    if (!mimeType || !data) {
      throw new Error("Invalid base64 image data");
    }

    const imagePart = {
      inlineData: { mimeType, data },
    };

    const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt },
          imagePart,
        ],
      },
    }));

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    return null; // No image found in response

  } catch (error) {
    console.error("Gemini AI Image Edit Error:", error);
    return null;
  }
};


export const generateKnowledgeCheck = async (transcript: string) => {
  const ai = getAiClient();
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
  const ai = getAiClient();
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
  const ai = getAiClient();
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
export const generateGuestIntroduction = async (photoUrl: string, guestName: string, topic?: string) => {
  const ai = getAiClient();
  const topicContext = topic ? `They will be discussing: ${topic}.` : '';
  const topicPrompt = topic ? `\n4. How to naturally lead into their topic: "${topic}"` : '';
  
  try {
    // If photoUrl is a base64 data URL, extract the data directly
    let imageData = "";
    let mimeType = "image/jpeg";
    
    if (photoUrl.startsWith('data:')) {
      // Extract base64 from data URL
      const matches = photoUrl.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        imageData = matches[2];
      }
    } else {
      // Fetch and convert image to base64
      imageData = await fetch(photoUrl).then(r => r.arrayBuffer()).then(b => Buffer.from(b).toString('base64')).catch(() => "");
    }
    
    const response = await retry<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          inlineData: {
            mimeType,
            data: imageData,
          },
        },
        `Analyze this photo of ${guestName}. ${topicContext}

Provide:
1. A 2-sentence professional introduction${topic ? ` that naturally mentions their topic "${topic}"` : ''}
2. 3-4 talking points about what makes them interesting (based on visual cues, attire, context${topic ? `, and their topic` : ''})
3. A suggested greeting topic${topicPrompt}

Format as JSON with fields: introduction, talkingPoints (array), suggestedGreeting`
      ],
      config: {
        responseMimeType: "application/json",
      }
    }));
    const text = response.text;
    try {
      return JSON.parse(text);
    } catch {
      return {
        introduction: topic 
          ? `Please welcome ${guestName}, who's joining us to discuss ${topic}!`
          : `Please welcome our guest ${guestName}!`,
        talkingPoints: topic 
          ? [`Explore their insights on ${topic}`, "Ask about their professional background", "Discuss their expertise", "Learn their perspective"]
          : ["Ask about their professional background", "Discuss their expertise", "Explore their insights"],
        suggestedGreeting: topic 
          ? `Welcome ${guestName}! We're thrilled to have you here to discuss ${topic}.`
          : `Welcome ${guestName}! We're excited to have you here.`
      };
    }
  } catch (error) {
    console.error("Guest Introduction Generation Error:", error);
    return {
      introduction: topic 
        ? `Please welcome ${guestName}, who's joining us to discuss ${topic}!`
        : `Please welcome our guest ${guestName}!`,
      talkingPoints: topic 
        ? [`Discuss ${topic}`, "Ask about their background", "Explore their expertise"]
        : ["Ask about their background", "Discuss their expertise", "Learn their perspective"],
      suggestedGreeting: `Welcome ${guestName}!`
    };
  }
};