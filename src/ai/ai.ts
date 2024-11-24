import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { response } from "../models/aiResponse";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey as string);

const getInstruction = (categories: string[]) => {
  var systemInstruction = `You are an AI vehicle insurance service center agent tasked with processing customer emails. Your goal is to analyze each email, determine the appropriate action required, classify it into one of the predefined categories, and provide a concise summary of the email content.

For each email, provide the following output:

Action: The verb related action to take (max 5 words).
Category: The category the email belongs to from the list below:
${categories.join(", ")}.

Summary: A brief and concise summary of the email content.
Output Format:
Your output must be in JSON format as shown below:

json
{
  "action": "",
  "category": "",
  "summary": ""
}
Examples:
Example 1:
Email Content:
Subject: Request to Add a New Vehicle to My Policy.

Dear XYZ Insurance,

I hope you are doing well. I would like to add a new vehicle to my auto insurance policy and update my coverage accordingly. Below are the details:

Policy Number: 123456789
Full Name: John Doe
Date of Birth: 01/01/1985
New Vehicle Information:

Make: Toyota
Model: Camry
Year: 2022
VIN: 1HGBH41JXMN109186
License Plate Number: ABC1234
Could you please update my policy to reflect this addition? I would also like to inquire if this will impact my monthly premium, and if so, how much it will increase. Thank you for your help. I look forward to hearing from you.

Best regards,
John Doe
johndoe@example.com

Output:

json
{
  "action": "Update Policy Details",
  "category": "Modifications",
  "summary": "Request to add a new vehicle to the policy and inquire about premium impact."
}
Example 2:
Email Content:
Subject: Request to Modify Payment Schedule.

Dear XYZ Insurance,

I would like to change my payment schedule from quarterly to monthly. Please update my payment plan and confirm.

Best regards,
Sarah White
sarahwhite@example.com

Output:

json
{
  "action": "Modify Payment Schedule",
  "category": "Modifications",
  "summary": "Request to change payment schedule from quarterly to monthly."
}
Example 3:
Email Content:
Subject: Inquiry Regarding Claim Status.

Dear XYZ Insurance,

I am writing to inquire about the status of my claim filed on 05/10/2024. The Claim Number is 111222333. Please provide an update on the progress.

Best regards,
Mark Brown
markbrown@example.com

Output:

json
{
  "action": "Provide Claim Status",
  "category": "Inquiries",
  "summary": "Inquiry about the status of claim number 111222333."
}
Key Points:
The action should always be verb-based and relate to what needs to be done.
The category should accurately reflect the nature of the email based on the request or issue raised.
The summary should be short, crisp, and capture the core content of the email.`;
  return systemInstruction;
};

export async function getAIResponse(categories: string[], mail: string) {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    systemInstruction: getInstruction(categories),
  });

  const generationConfig = {
    temperature: 1.15,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };

  const chatSession = model.startChat({
    generationConfig,
  });

  const result = await chatSession.sendMessage(mail);
  return result.response.text();
}
