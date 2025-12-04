import { GoogleGenAI, Type } from "@google/genai";
import { ACState, ACMode, FanSpeed } from "../types";

const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const interpretVoiceCommand = async (
  command: string,
  currentState: ACState
): Promise<{ settings?: Partial<ACState>; reply: string }> => {
  try {
    if (!ai) {
      return {
        reply: "AI assistant is not configured. Please add your Gemini API key.",
      };
    }
    const prompt = `
      Current AC State: ${JSON.stringify(currentState)}
      User Command: "${command}"

      You are a smart home assistant for an air conditioner.
      Interpret the user's command and return a JSON object with the necessary state updates and a short polite reply.
      
      Rules:
      - If the user says "it's hot", suggest cooling or lowering temp.
      - If the user says "quiet", maybe suggest sleep mode or low fan.
      - If the user says "goodnight", suggest sleep mode or timer.
      - Only return fields that need to change.
      - Ensure 'mode' is one of: COOL, HEAT, DRY, FAN, AUTO.
      - Ensure 'fanSpeed' is one of: AUTO, LOW, MID, HIGH, TURBO.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            settings: {
              type: Type.OBJECT,
              properties: {
                power: { type: Type.BOOLEAN },
                mode: { type: Type.STRING, enum: Object.values(ACMode) },
                targetTemp: { type: Type.NUMBER },
                fanSpeed: { type: Type.STRING, enum: Object.values(FanSpeed) },
                swingVertical: { type: Type.BOOLEAN },
                swingHorizontal: { type: Type.BOOLEAN },
                ecoMode: { type: Type.BOOLEAN },
                sleepMode: { type: Type.BOOLEAN },
                turboMode: { type: Type.BOOLEAN },
              },
              description: "The updated settings for the AC",
            },
            reply: {
              type: Type.STRING,
              description: "A short, natural language confirmation of the action.",
            },
          },
          required: ["reply"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      reply: "Sorry, I couldn't connect to the smart assistant service.",
    };
  }
};
