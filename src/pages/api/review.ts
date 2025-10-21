import type { NextApiRequest, NextApiResponse } from 'next';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method not allowed' });
  }

  try {
    const { resume, jobDescription } = req.body;

    if (!resume || !jobDescription) {
      return res.status(400).json({ error: 'resume and job description are required.' });
    }

    const prompt = `
      You are an expert AI-powered resume reviewer named 'resumate'. You have been trained on millions of job descriptions and resumes from top tech companies. You provide clear, concise, and actionable feedback to help candidates land their dream jobs.

      Analyze the following resume against the provided job description. Provide a detailed analysis based on the following criteria:
      1.  **Overall Match Score:** A percentage score from 0 to 100 indicating how well the resume matches the job description. Be critical but fair.
      2.  **Summary:** A brief, insightful summary of the candidate's fit for the role.
      3.  **Strengths:** A list of 3-5 key strengths and qualifications from the resume that directly align with the job requirements.
      4.  **Areas for Improvement:** A list of 3-5 specific, actionable suggestions for improving the resume. For example: "Quantify the achievement in 'Managed project X' by adding metrics like 'Managed project X, resulting in a 15% increase in efficiency'."
      5.  **Keyword Comparison:** Identify at least 10-15 of the most important keywords and skills from the job description. Then, identify which of those keywords are present in the resume.

      **Resume:**
      ---
      ${resume}
      ---

      **Job Description:**
      ---
      ${jobDescription}
      ---

      Return your analysis ONLY as a single, valid JSON object. Do not include any text, markdown formatting, or explanations outside of the JSON object. The JSON object must have the following structure:
      {
        "matchScore": number,
        "summary": string,
        "strengths": string[],
        "improvements": string[],
        "keywordAnalysis": {
          "jobKeywords": string[],
          "resumeKeywords": string[]
        }
      }
    `;

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    };

    const response = await fetch(`${GEMINI_API_URL}${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('gemini API Error:', errorBody);
      return res.status(502).json({ error: `gemini API request failed with status ${response.status}` });
    }

  const data = await response.json();
  const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;

    if (!responseText) {
      console.error('no content returned from Gemini:', JSON.stringify(data));
      return res.status(502).json({ error: 'invalid response from language model.' });
    }

    type ModelOutput = {
      matchScore: number;
      summary: string;
      strengths: string[];
      improvements: string[];
      keywordAnalysis: {
        jobKeywords: string[];
        resumeKeywords: string[];
      };
    };

    try {
      const parsedJson = JSON.parse(responseText as string) as ModelOutput;
      return res.status(200).json(parsedJson);
    } catch (parseError: unknown) {
      console.error('failed to parse model output as JSON:', responseText, parseError);
      return res.status(502).json({ error: 'model returned non-JSON output.' });
    }
  } catch (error: unknown) {
    console.error('review handler failed:', error);
    const message = error instanceof Error ? error.message : 'failed to get analysis.';
    return res.status(500).json({ error: message });
  }
}
