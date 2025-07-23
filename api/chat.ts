import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  GoogleGenerativeAI,
  type ChatSession,
} from "@google/generative-ai";
import { marked } from "marked";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 0.9,
    topP: 1,
    topK: 1,
    maxOutputTokens: 2048,
  },
});

// Store chat sessions in memory - 이제 하나의 파일에서 관리
const chatSessions = new Map<string, ChatSession>();

// Format raw text into proper markdown
async function formatResponseToMarkdown(
  text: string | Promise<string>
): Promise<string> {
  const resolvedText = await Promise.resolve(text);
  let processedText = resolvedText.replace(/\r\n/g, "\n");

  processedText = processedText.replace(
    /^([A-Za-z][A-Za-z\s]+):(\s*)/gm,
    "## $1$2"
  );

  processedText = processedText.replace(
    /(?<=\n|^)([A-Za-z][A-Za-z\s]+):(?!\d)/gm,
    "### $1"
  );

  processedText = processedText.replace(/^[•●○]\s*/gm, "* ");

  const paragraphs = processedText.split("\n\n").filter(Boolean);

  const formatted = paragraphs
    .map((p) => {
      if (p.startsWith("#") || p.startsWith("*") || p.startsWith("-")) {
        return p;
      }
      return `${p}\n`;
    })
    .join("\n\n");

  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  return marked.parse(formatted);
}

// Extract sources from grounding metadata
function extractSources(response: any) {
  const sourceMap = new Map<
    string,
    { title: string; url: string; snippet: string }
  >();

  // Get grounding metadata from response
  const metadata = response.candidates?.[0]?.groundingMetadata as any;
  if (metadata) {
    const chunks = metadata.groundingChunks || [];
    const supports = metadata.groundingSupports || [];

    chunks.forEach((chunk: any, index: number) => {
      if (chunk.web?.uri && chunk.web?.title) {
        const url = chunk.web.uri;
        if (!sourceMap.has(url)) {
          // Find snippets that reference this chunk
          const snippets = supports
            .filter((support: any) =>
              support.groundingChunkIndices.includes(index)
            )
            .map((support: any) => support.segment.text)
            .join(" ");

          sourceMap.set(url, {
            title: chunk.web.title,
            url: url,
            snippet: snippets || "",
          });
        }
      }
    });
  }

  return Array.from(sourceMap.values());
}

// Handle new search (GET request)
async function handleNewSearch(query: string) {
  // Create a new chat session with search capability
  const chat = model.startChat({
    tools: [
      {
        // @ts-ignore - google_search is a valid tool but not typed in the SDK yet
        google_search: {},
      },
    ],
  });

  // Generate content with search tool
  const result = await chat.sendMessage(query);
  const response = await result.response;
  const text = response.text();

  // Format the response text to proper markdown/HTML
  const formattedText = await formatResponseToMarkdown(text);

  // Extract sources from grounding metadata
  const sources = extractSources(response);

  // Generate a session ID and store the chat
  const sessionId = Math.random().toString(36).substring(7);
  chatSessions.set(sessionId, chat);

  return {
    sessionId,
    summary: formattedText,
    sources,
  };
}

// Handle follow-up question (POST request)
async function handleFollowUp(sessionId: string, query: string) {
  const chat = chatSessions.get(sessionId);
  if (!chat) {
    throw new Error("Chat session not found");
  }

  // Send follow-up message in existing chat
  const result = await chat.sendMessage(query);
  const response = await result.response;
  const text = response.text();

  // Format the response text to proper markdown/HTML
  const formattedText = await formatResponseToMarkdown(text);

  // Extract sources from grounding metadata
  const sources = extractSources(response);

  return {
    summary: formattedText,
    sources,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'GET') {
      // Handle new search
      const query = req.query.q as string;

      if (!query) {
        return res.status(400).json({
          message: "Query parameter 'q' is required",
        });
      }

      const result = await handleNewSearch(query);
      res.json(result);

    } else if (req.method === 'POST') {
      // Handle follow-up question
      const { sessionId, query } = req.body;

      if (!sessionId || !query) {
        return res.status(400).json({
          message: "Both sessionId and query are required",
        });
      }

      try {
        const result = await handleFollowUp(sessionId, query);
        res.json(result);
      } catch (error: any) {
        if (error.message === "Chat session not found") {
          // Fallback to new search if session is not found
          console.log(`Session ${sessionId} not found, starting new search`);
          const result = await handleNewSearch(query);
          res.json(result);
        } else {
          throw error;
        }
      }

    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({
      message:
        error.message || "An error occurred while processing your request",
    });
  }
}