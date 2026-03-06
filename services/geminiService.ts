
import { GoogleGenAI } from "@google/genai";
import { ESG_DOC_CONTEXT } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getCarbonReasoning = async (query: string, currentData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        You are a senior sustainability consultant for Carbon Intellect specializing in
GHG Protocol analysis, Scope 1/2/3 emissions accounting, and Net Zero strategy.
        Below is the context retrieved from ESG reports and GHG protocols (RAG Context):
        ---
        ${ESG_DOC_CONTEXT}
        ---
        
        Current Organizational Carbon Data (JSON):
        ---
        ${JSON.stringify(currentData)}
        ---

        User Query: ${query}

       Instructions:
1. Use the GHG Protocol standards to explain concepts if requested.
2. Reference the current data to provide specific insights.
3. Provide actionable recommendations based on the findings.
4. Be professional, data-driven, and concise.
5. Avoid overly precise numbers when discussing forecasts or projections.
   Instead of exact values like "1675.65", round them into approximate ranges
   such as "~1,670–1,700 units".
6. Format your response with clear headings and bullet points where applicable.
      `,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Reasoning Error:", error);
    return "I'm sorry, I couldn't process that request right now. Please check your API key and connection.";
  }
};
