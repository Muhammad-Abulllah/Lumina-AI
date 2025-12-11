import { GoogleGenAI } from "@google/genai";
import { Message, Role, Attachment } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Converts a browser File object to a Base64 string.
 * Supports Image and Video types.
 */
export const fileToGenerativePart = async (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      
      // Data URLs format: "data:[mimeType];base64,[data]"
      // Example: "data:image/jpeg;base64,/9j/4AAQ..." or "data:video/mp4;base64,AAAA..."
      const base64Data = base64String.split(',')[1];
      
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Sends a message to Gemini with full conversation history and optional attachments (Images/Video).
 */
export async function* streamGeminiResponse(
  history: Message[],
  newMessage: string,
  attachments: Attachment[] = []
): AsyncGenerator<string, void, unknown> {
  
  // 1. Format History
  // We filter out the initial welcome message (id: 'welcome')
  const formattedHistory = history
    .filter(msg => msg.id !== 'welcome' && (msg.text || (msg.attachments && msg.attachments.length > 0)))
    .map(msg => {
      const parts: any[] = [];
      
      // Add existing attachments from history
      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach(att => {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data
            }
          });
        });
      }
      
      // Add text content
      if (msg.text) {
        parts.push({ text: msg.text });
      }

      return {
        role: msg.role,
        parts: parts
      };
    });

  // 2. Format New Message Content
  const currentParts: any[] = [];
  
  // Add new attachments (Image or Video)
  attachments.forEach(att => {
    currentParts.push({
      inlineData: {
        mimeType: att.mimeType,
        data: att.data
      }
    });
  });
  
  // Add new text prompt
  if (newMessage) {
    currentParts.push({ text: newMessage });
  }

  try {
    // Use Chat API for context awareness
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: "You are Lumina, a helpful, witty, and concise AI assistant. You prefer short, elegant answers unless asked for details. You can see images and watch video clips.",
      },
      history: formattedHistory
    });

    const responseStream = await chat.sendMessageStream({
      message: currentParts
    });

    for await (const chunk of responseStream) {
       const text = chunk.text;
       if (text) {
         yield text;
       }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "I encountered an error connecting to the neural network. Please check your connection and try again.";
  }
}