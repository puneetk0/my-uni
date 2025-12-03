import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

async function withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 600): Promise<T> {
  let lastErr: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Simple timeout wrapper (15s per attempt)
      const res = await Promise.race<T>([
        fn(),
        new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), 15000)),
      ]);
      return res;
    } catch (e) {
      lastErr = e;
      if (attempt < retries) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
    }
  }
  throw lastErr;
}

export async function generateOpportunitySummary(input: {
  title: string;
  description?: string;
  type?: string;
  organization?: string;
  location?: string;
  eligibility?: string;
  deadline?: string;
  applyUrl?: string;
  detailsUrl?: string;
  joinTeamUrl?: string;
  tags?: string[];
}): Promise<string> {
  try {
    if (!apiKey) throw new Error('missing_api_key');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const clean = (v?: string) => (v && String(v).trim().length > 0 ? v : undefined);
    const parts: string[] = [];
    parts.push(`Title: ${input.title}`);
    if (clean(input.type)) parts.push(`Type: ${input.type}`);
    if (clean(input.organization)) parts.push(`Organization: ${input.organization}`);
    if (clean(input.location)) parts.push(`Location: ${input.location}`);
    if (clean(input.deadline)) parts.push(`Deadline: ${new Date(input.deadline as string).toLocaleDateString()}`);
    if (clean(input.eligibility)) parts.push(`Eligibility: ${input.eligibility}`);
    if (Array.isArray(input.tags) && input.tags.length) parts.push(`Tags: ${input.tags.join(', ')}`);
    if (clean(input.applyUrl)) parts.push(`Apply: ${input.applyUrl}`);
    if (clean(input.detailsUrl)) parts.push(`Details: ${input.detailsUrl}`);
    if (clean(input.joinTeamUrl)) parts.push(`Join Team: ${input.joinTeamUrl}`);
    if (clean(input.description)) parts.push(`Description: ${input.description}`);

    const prompt = `Write a concise first-person summary as the opportunity organizer. Use only the facts provided. Do not mention that the data was provided or speculate. Be concrete and helpful. Keep it to 2 short paragraphs (max ~150 words total).

${parts.join('\n')}

Instructions:
- Voice: first-person plural ("we").
- Include specifics like deadline, eligibility, location, type, and organization when available.
- If links are provided, naturally mention how to apply or learn more without dumping raw URLs.
- No prefaces, no disclaimers, no headings. Just the narrative.`;

    const result = await withRetry(() => model.generateContent(prompt));
    const response = await result.response;
    return response.text();
  } catch (e) {
    console.error('Gemini opportunity summary failed:', e);
    // Fallback: construct a compact first-person summary using available fields
    const bits: string[] = [];
    bits.push(`We’re sharing an opportunity: ${input.title}.`);
    if (input.organization) bits.push(`At ${input.organization}.`);
    if (input.type) bits.push(`Type: ${input.type}.`);
    if (input.location) bits.push(`Location: ${input.location}.`);
    if (input.deadline) bits.push(`Deadline: ${new Date(input.deadline).toLocaleDateString()}.`);
    if (input.eligibility) bits.push(`Eligibility: ${input.eligibility}.`);
    if (input.description) bits.push(input.description);
    const links: string[] = [];
    if (input.applyUrl) links.push('apply');
    if (input.detailsUrl) links.push('learn more');
    if (input.joinTeamUrl) links.push('join the team');
    if (links.length) bits.push(`You can ${links.join(', ')} via the provided links.`);
    return bits.join(' ');
  }
}

export async function generateConciseSummary(achievement: {
  title: string;
  description: string;
  how_it_started: string | null;
  how_we_built_it: string | null;
  what_we_achieved: string | null;
  what_we_learned: string | null;
}): Promise<string> {
  try {
    if (!apiKey) throw new Error('missing_api_key');
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Please create a concise, engaging summary of this achievement in 2-3 short paragraphs. Focus on the key points and make it easy to read:
    
    Title: ${achievement.title}
    Description: ${achievement.description}
    How it started: ${achievement.how_it_started || 'Not specified'}
    How we built it: ${achievement.how_we_built_it || 'Not specified'}
    What we achieved: ${achievement.what_we_achieved || 'Not specified'}
    What we learned: ${achievement.what_we_learned || 'Not specified'}
    
    Please provide a well-structured, engaging summary that captures the essence of this achievement.`;

    const result = await withRetry(() => model.generateContent(prompt));
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
    if (!apiKey) throw new Error('missing_api_key');
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
    const result = await withRetry(() => model.generateContent(prompt));
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
