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

export async function generateOpportunitySuggestions(input: {
  title: string;
  description: string;
  type: string;
  organization?: string;
}): Promise<{ shortDescription: string; tags: string[] } | null> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `Given the following opportunity details, propose:
    1) A concise short_description under 150 characters
    2) A list of 5-8 relevant tags (single words or short phrases)

    Return strictly as JSON with keys shortDescription (string) and tags (string array).

    Title: ${input.title}
    Type: ${input.type}
    Organization: ${input.organization || 'N/A'}
    Description: ${input.description}
    `;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const json = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
      return {
        shortDescription: String(json.shortDescription || '').slice(0, 150),
        tags: Array.isArray(json.tags) ? json.tags.map((t: any) => String(t)).slice(0, 8) : [],
      };
    }
    return null;
  } catch (e) {
    console.error('Gemini suggestions failed:', e);
    return null;
  }
}
