import { gmail_v1 } from "googleapis";
import { simpleParser } from "mailparser";

export const getMailData = (id: string, gmail: gmail_v1.Gmail) => {

  const res1 = gmail.users.messages.get({
    format: "raw",
    id: id,
    userId: "me",
  });
  return new Promise((res, rej) => {
    res1
      .then(async (data: any) => {
        if (data.data.raw) {
          // console.log(data.data)
          // Decode the Base64 URL-encoded email content
          const decodedMessage = Buffer.from(
            data.data.raw,
            "base64url"
          ).toString("utf-8");
          const result = await simpleParser(decodedMessage, {
            decodeStrings: true,
          });
          res({...result, snippet: data.data.snippet});
        }
      })
      .catch((error: any) => {
        console.error("Error fetching the message:", error);
        rej(error)
      });
  });
};
