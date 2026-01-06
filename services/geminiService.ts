
import { GoogleGenAI } from "@google/genai";

// Initialize with process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

let quotaExceeded = false;

export const getEvolutionTip = async (animalName: string): Promise<string> => {
  if (quotaExceeded) return "Watch your tail, it's a jungle out there!";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an expert paleontologist. Give a one-sentence survival tip for a player who just evolved into a ${animalName} in a Dinosaur IO game. Be witty, dinosaur-themed, and helpful.`,
    });
    return response.text || "Watch your tail, it's a jungle out there!";
  } catch (error: any) {
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
        console.warn("Gemini Quota Exceeded. Switching to offline mode.");
        quotaExceeded = true;
    }
    return "Pangea is shifting. Stay alert for predators!";
  }
};

export const getDailyChallenge = async (): Promise<string> => {
  if (quotaExceeded) return "Hunt and evolve to rule Pangea.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Generate a short, funny daily quest for a dinosaur survival game set in Pangea. Example: 'Scare 5 Compsognathus' or 'Drink from the Great River while a predator watches'.",
    });
    return response.text || "Hunt and evolve to rule Pangea.";
  } catch (error: any) {
    if (error.status === 429 || (error.message && error.message.includes('429'))) {
        quotaExceeded = true;
    }
    return "Survive the asteroid-less era!";
  }
};
