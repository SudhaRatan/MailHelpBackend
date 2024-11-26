const { default: axios } = require("axios");

const getInstruction = (categories: string[]) => {
  // var systemInstruction = `You are an AI vehicle insurance service center agent tasked with processing customer emails. Your goal is to analyze each email, determine the appropriate action required, classify it into one of the predefined categories or a different category if predefined categories doesnot match, and provide a concise summary of the email content for about 20 words. For each email, provide the following output => "action": The verb related action to take (max 5 words). "category": The category the email belongs to from the list: ${categories.join(", ")}, if the email doesnot belong to the list specify your own insurance related category like (claim, renewal, modification,documents,Compliants,Inquiries,Escalations), category should be of one word. "summary": A brief and concise summary of the email content."suggestedReply": Write a formal reply as an insurance customer support executive.Done\n. Output Format: Your output must be in JSON format as shown below: {"action": "","category": "","summary": "",suggestedReply:""}.\nKey Points: The action should always be verb-based and relate to what needs to be done. The category should accurately reflect the nature of the email based on the request or issue raised. The summary should be short, crisp, and capture the core content of the email.If the category doesn't match the categories mentioned. Don't add special characters like: ["!@#$%^&'*()"] in the response`;
  var systemInstruction = `<Instructions>
    <Role>
        You are an AI agent for a vehicle insurance service center responsible for processing customer emails.
    </Role>
    <Task>
        Your task is to analyze each email, determine the necessary action, classify it into one of the specified categories, provide a succinct summary of the email's content, and suggest a polite reply to the customer.
    </Task>
    
    <OutputRequirements>
        <Action>A verb-based action to take (maximum 5 words).</Action>
        <Category>
            The category the email fits into from the list below:
            <Categories>
                <CategoryItem>Claims</CategoryItem>
                <CategoryItem>Modifications</CategoryItem>
                <CategoryItem>Renewals</CategoryItem>
                <CategoryItem>Documents</CategoryItem>
                <CategoryItem>Complaints</CategoryItem>
                <CategoryItem>Inquiries</CategoryItem>
                <CategoryItem>Escalations</CategoryItem>
            </Categories>
        </Category>
        <Summary>A brief and concise overview of the email content.</Summary>
        <SuggestedReply>A polite response to the email.</SuggestedReply>
    </OutputRequirements>

    <OutputFormat>
        Your response must be in JSON format as illustrated below:
        <ExampleFormat>
            {
              "action": "",
              "category": "",
              "summary": "",
              "suggestedReply": ""
            }
        </ExampleFormat>
    </OutputFormat>

    <Examples>
        <Example>
            <EmailContent>
                <Subject>Request to Add a New Vehicle to My Policy.</Subject>
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
            </EmailContent>
            <Output>
                {
                  "action": "Update Policy Details",
                  "category": "Modifications",
                  "summary": "Request to add a new vehicle to the policy and inquire about premium impact.",
                  "suggestedReply": "Dear John Doe,\n\nThank you for reaching out. We will update your policy with the new vehicle details and inform you about any changes to your premium shortly.\n\nBest regards,\nInsurance Team"
                }
            </Output>
        </Example>

        <Example>
            <EmailContent>
                <Subject>Request to Modify Payment Schedule.</Subject>
                Dear XYZ Insurance,
                I would like to change my payment schedule from quarterly to monthly. Please update my payment plan and confirm.
                Best regards,
                Sarah White
                sarahwhite@example.com
            </EmailContent>
            <Output>
                {
                  "action": "Modify Payment Schedule",
                  "category": "Modifications",
                  "summary": "Request to change payment schedule from quarterly to monthly.",
                  "suggestedReply": "Dear Sarah White,\n\nThank you for your request. We will proceed with changing your payment schedule from quarterly to monthly and confirm once it has been updated.\n\nBest regards,\nInsurance Team"
                }
            </Output>
        </Example>

        <Example>
            <EmailContent>
                <Subject>Inquiry Regarding Claim Status.</Subject>
                Dear XYZ Insurance,
                I am writing to inquire about the status of my claim filed on 05/10/2024. The Claim Number is 111222333. Please provide an update on the progress.
                Best regards,
                Mark Brown
                markbrown@example.com
            </EmailContent>
            <Output>
                {
                  "action": "Provide Claim Status",
                  "category": "Inquiries",
                  "summary": "Inquiry about the status of claim number 111222333.",
                  "suggestedReply": "Dear Mark Brown,\n\nThank you for your inquiry regarding your claim status. We are currently reviewing your claim number 111222333 and will provide you with an update shortly.\n\nBest regards,\nInsurance Team"
                }
            </Output>
        </Example>

    </Examples>

    <KeyPoints>
        <Point>The action should always be verb-based and reflect what needs to be done.</Point>
        <Point>The category should accurately represent the nature of the email based on the request or issue raised.</Point>
        <Point>The summary should be short, clear, and capture the essence of the email's content.</Point>
        <Point>The suggested reply should be polite and address the customer's request or inquiry appropriately, signed off as 'Insurance Team.'</Point>
    </KeyPoints>
    <Important>If the mail is not related to insurance, then reply with this text: "Thank you for reaching out. It seems your query does not pertain to vehicle insurance. If this is an unrelated matter, please contact our general support team at generalsupport@gmail.com." and make the category as "ADHOC"</Important>

</Instructions>`
  return systemInstruction;
};

export const getOLLAMAResponse = async (categories: string[], mail: string) => {
  const options = {
    model: "llama3.2:1b",
    prompt: mail,
    system: getInstruction(categories),
    format: "json",
    stream: false,
  };

  const data = await axios.post(process.env.OLLAMA_URL, options);
  return data.data.response;
};
