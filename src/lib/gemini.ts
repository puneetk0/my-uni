import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export async function generateConciseSummary(achievement: {
  title: string;
  description: string;
  how_it_started: string | null;
  how_we_built_it: string | null;
  what_we_achieved: string | null;
  what_we_learned: string | null;
}): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Please create a concise, engaging summary of this achievement in 2-3 short paragraphs. Focus on the key points and make it easy to read:
    
    Title: ${achievement.title}
    Description: ${achievement.description}
    How it started: ${achievement.how_it_started || 'Not specified'}
    How we built it: ${achievement.how_we_built_it || 'Not specified'}
    What we achieved: ${achievement.what_we_achieved || 'Not specified'}
    What we learned: ${achievement.what_we_learned || 'Not specified'}
    
    Please provide a well-structured, engaging summary that captures the essence of this achievement.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary with Gemini:', error);
    // Fallback to a simple concatenation if Gemini fails
    return [
      achievement.description,
      achievement.how_it_started,
      achievement.what_we_achieved,
      achievement.what_we_learned
    ].filter(Boolean).join('\n\n');
  }
}
