import { promises as fs } from "fs";
import path from "path";
import { authenticate } from "@google-cloud/local-auth";
import { gmail_v1, google } from "googleapis";
import { simpleParser } from "mailparser";
import bodyParser from "body-parser";

import express from "express";
import http from "http";
import cors from "cors";

import { verifyToken } from "./middlewares/Auth";
import { getMailData } from "./utils/MailUtils";

const app = express();
const server = http.createServer(app);
const port = 3000;

app.use(bodyParser.json());
// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "src", "./token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "src", "./credentials.json");
export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const REDIRECT_URL = process.env.REDIRECT_URL;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth: any, index: number): Promise<any> {
  const gmail = google.gmail({ version: "v1", auth });

  const r = await gmail.users.messages.list({ userId: "me" });
  console.log(r.data.messages);
  const res1 = gmail.users.messages.get({
    format: "raw",
    id: r.data.messages![index].id!,
    userId: "me",
  });
  return new Promise((res, rej) => {
    res1
      .then(async (data) => {
        if (data.data.raw) {
          // Decode the Base64 URL-encoded email content
          const decodedMessage = Buffer.from(
            data.data.raw,
            "base64url"
          ).toString("utf-8");

          const result = await simpleParser(decodedMessage, {
            decodeStrings: true,
          });
          res(result);
        }
      })
      .catch((error) => {
        console.error("Error fetching the message:", error);
      });
  });
}

const corsOptions = {
  origin: "*",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URL
);

app.get("/", (req, res) => {
  const d = {
    html: `<h1>MailHelp</h1><a href="/auth/google">Login With Google</a>`,
  };
  res.send(d.html);
});

// app.get("/auth/google", (req, res) => {
//   const authUrl = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: SCOPES,
//   });
//   res.redirect(authUrl);
// });

// app.get("/oauth2callback", async (req, res) => {
//   const { code } = req.query;
//   try {
//     const { tokens } = await oauth2Client.getToken(code as string);
//     if(tokens?.refresh_token){
//       oauth2Client.setCredentials(tokens);
//     }
//     res.send("Authentication successful! <br> <a href='mailData/0'>Get mail data</a>");
//   } catch (error) {
//     console.error("Error getting tokens:", error);
//     res.status(500).send("Error authenticating");
//   }
// });

app.post("/api/auth", async (req, res) => {
  const { access_token } = req.body;

  try {
    const response = await fetch("https://oauth2.googleapis.com/tokeninfo", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `access_token=${access_token}`,
    });

    const tokenInfo = await response.json();
    console.log(tokenInfo);

    oauth2Client.setCredentials({ access_token: access_token });
    // const response = await gmail.users.messages.list({ userId: 'me' });

    res.json({
      success: true,
      message: "Logged in successfully",
      data: tokenInfo,
    });
  } catch (error: any) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/getMails", verifyToken, async (req, res) => {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const r = await gmail.users.messages.list({ userId: "me", maxResults: 20 });
  console.log(r.data);
  res.send(r.data);
});

app.get("/mailData/:id", async (req, res) => {
  try {
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const id = req.params.id;
    const d = await getMailData(id, gmail);
    res.send(d);
  } catch (e: any) {
    console.log(e);
    res.status(401).send(e)
  }
});

server.listen(3000, function () {
  console.log("listening");
});
