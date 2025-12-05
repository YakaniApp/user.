
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TransactionDetails, TransactionResult, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const transactionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    transactionId: {
      type: Type.STRING,
      description: "A unique 12-character alphanumeric transaction ID.",
    },
    status: {
      type: Type.STRING,
      enum: ["SUCCESS", "FAILED", "PENDING", "WAITING_VERIFICATION"],
      description: "The status of the transaction.",
    },
    message: {
      type: Type.STRING,
      description: "A friendly confirmation message, clearly stating that the admin is checking the reference number.",
    },
    estimatedArrival: {
      type: Type.STRING,
      description: "Estimated time description (e.g., '10-30 Minutes', 'Within 1 Hour').",
    },
    fees: {
      type: Type.NUMBER,
      description: "Calculated transaction fee.",
    },
  },
  required: ["transactionId", "status", "message", "estimatedArrival", "fees"],
};

const chatSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      sender: {
        type: Type.STRING,
        description: "Name of the fictional user replying (e.g., Somali or Ugandan names).",
      },
      text: {
        type: Type.STRING,
        description: "The content of the reply message.",
      },
    },
    required: ["sender", "text"],
  },
};

// Helper to check online status
const isOnline = () => typeof navigator !== 'undefined' && navigator.onLine;

export const processTransactionWithGemini = async (details: TransactionDetails): Promise<TransactionResult> => {
  // Deterministic Fee Calculation (1.5%)
  const calculatedFee = details.amountSend * 0.015;

  // OFFLINE FALLBACK: If no internet, process locally
  if (!isOnline()) {
      console.log("App is offline. Processing locally.");
      return {
          transactionId: "OFFLINE-" + Date.now().toString().slice(-6),
          status: "WAITING_VERIFICATION",
          message: "Offline Mode: Request saved locally. Admin will verify when back online.",
          estimatedArrival: "When Online",
          fees: calculatedFee
      };
  }

  try {
    let recipientInfo = "";
    if (details.recipient.withdrawalMethod === 'MOBILE_MONEY') {
      recipientInfo = `Mobile Money: ${details.recipient.network} - ${details.recipient.phone}`;
    } else {
      recipientInfo = `Bank Transfer: ${details.recipient.bankName} - Account: ${details.recipient.accountNumber}`;
    }

    const directionText = details.direction === 'SOM_TO_UGA' ? 'Somalia to Uganda' : 'Uganda to Somalia';
    const senderCountryCode = details.direction === 'SOM_TO_UGA' ? '+252' : '+256';

    const prompt = `
      Process this MANUAL money transfer request.
      Direction: ${directionText}
      
      Sender: ${details.senderName} (Phone: ${senderCountryCode} ${details.senderPhone})
      Amount Sent: ${details.amountSend} ${details.currencySend}
      Manual Payment Reference Provided by User: ${details.senderTransactionRef}
      
      Recipient Name: ${details.recipient.fullName}
      Recipient Destination: ${recipientInfo}
      
      User requested WhatsApp notification: ${details.notifyOnWhatsapp ? 'Yes' : 'No'}
      
      Act as the backend processor for 'SomalUganda Remit'. 
      Since this is a manual system where the user sends money to an Agent number first:
      1. The Status MUST be "WAITING_VERIFICATION" or "PENDING".
      2. The message must confirm that the Admin has received the request and is verifying the manual payment reference.
      3. Estimated arrival should be "15-30 Minutes" (Manual verification time).
      
      The fee should be exactly ${calculatedFee}.

      The message should be reassuring: "We have received your request. Admin is verifying your payment Ref: ${details.senderTransactionRef}. Funds will be released shortly."
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: transactionSchema,
        temperature: 0.2, // Low temperature for consistent processing
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No response from AI processor");
    }

    const result = JSON.parse(jsonText) as TransactionResult;
    
    // Safety Force: Ensure fees are mathematically correct regardless of AI output
    result.fees = calculatedFee;
    
    return result;

  } catch (error) {
    console.error("Gemini processing error:", error);
    // Fallback if API fails but internet exists
    return {
      transactionId: "LOC-" + Date.now().toString().slice(-6),
      status: "WAITING_VERIFICATION",
      message: "Request received. We are verifying your payment manually.",
      estimatedArrival: "30 Minutes",
      fees: calculatedFee
    };
  }
};

export const getChatResponses = async (userMessage: string, history: ChatMessage[]): Promise<Omit<ChatMessage, 'id' | 'isUser' | 'timestamp' | 'avatarColor'>[]> => {
  if (!isOnline()) return []; // No chat bots offline

  try {
    const historyText = history.slice(-5).map(m => `${m.sender}: ${m.text}`).join('\n');
    
    const prompt = `
      You are simulating a lively community chat for "SomalUganda Remit".
      Users discuss agent reliability, sending cash to the agent numbers (+252... / +256...), and confirming receipt.
      
      Recent Chat History:
      ${historyText}
      
      New User Message: "${userMessage}"
      
      Generate 1 or 2 realistic responses from other fictional community members.
      Mention things like "Admin is fast today" or "Make sure you send the screenshot".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: chatSchema,
        temperature: 0.7, 
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Gemini chat error:", error);
    return [];
  }
};

export const getAiGuideResponse = async (userQuery: string): Promise<string> => {
    if (!isOnline()) {
        return "You are currently offline. Basic transfer features still work, but I cannot answer questions right now.";
    }

    try {
        const prompt = `
          You are the friendly AI Assistant for 'SomalUganda Remit'. 
          Your job is to teach users how to use the Manual Agent System.
          
          App Details:
          - How it works: You send money to our Agent Number manually first. Then you enter the Transaction ID in the app. We verify and pay your recipient.
          - Agent Numbers: +252 771 957 722 (Somalia) and +256 779 334 452 (Uganda).
          - Speed: Takes about 15-30 minutes for manual verification.
          - Fees: 1.5% flat fee.
          - Admin Contact: WhatsApp available on the dashboard.

          User Question: "${userQuery}"

          Provide a short, helpful, and concise answer (max 2-3 sentences).
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text || "Please contact Admin support via WhatsApp.";
    } catch (error) {
        console.error("AI Guide Error", error);
        return "I am currently offline. Please check the Help section.";
    }
}
