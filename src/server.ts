import { gmail_v1, google } from "googleapis";
import bodyParser from "body-parser";

import express from "express";
import http from "http";
import cors from "cors";

import { verifyToken } from "./middlewares/Auth";
import { getMailData } from "./utils/MailUtils";

// Routes
import categoryRouter from "./routes/category";

import { Server } from "socket.io";
import { category } from "./models/category";
import {
  getAiData,
  getCategoryMails,
  saveAIData,
  updateAIData,
} from "./dataAccess/aiDL";
import { getAIResponse } from "./ai/ai";
import { response } from "./models/aiResponse";
import { getOLLAMAResponse } from "./ai/aiOllama";
import {
  getDashboardData,
  insertIfNotExists,
  loadReply,
  readMail,
  setReply,
  toggleResolve,
} from "./dataAccess/mailDL";
import GmailReply from "./utils/MailReply";

const app = express();
const server = http.createServer(app);
const port = 3000;

export const io = new Server(server, { cors: { origin: "*" } });

export var categories: category[] = [];

export const setCategories = (c: category[]) => {
  categories = c;
};

app.use(bodyParser.json());

export const CLIENT_ID = process.env.CLIENT_ID;
export const CLIENT_SECRET = process.env.CLIENT_SECRET;
export const REDIRECT_URL = process.env.REDIRECT_URL;

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

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
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    // await gmail.users.stop({ userId: "me" });
    await gmail.users.watch({
      userId: "me",
      requestBody: {
        labelIds: ["INBOX"],
        topicName: "projects/mailhelp-442113/topics/MyTopic",
        labelFilterAction: "INCLUDE",
      },
    });

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

app.get("/logout", async (req, res) => {
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  try {
    await gmail.users.stop({ userId: "me" });
  } catch (error) {}
});

app.get("/getMails", verifyToken, async (req, res) => {
  const { nextPageToken, max } = req.query;
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  try {
    var r;
    r = await gmail.users.messages.list({
      userId: "me",
      maxResults: max,
      pageToken: nextPageToken,
      labelIds: ["INBOX"],
      q: "-in:sent",
    } as gmail_v1.Params$Resource$Users$Messages$List);
    res.send(r.data)
  } catch (error) {
    console.log(error);
    res.status(401).send();
  }
});

app.post("/sendReply", async (req, res) => {
  const { threadId, mailBody, access_token, mailId } = req.body;
  const response = await fetch("https://oauth2.googleapis.com/tokeninfo", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `access_token=${access_token}`,
  });
  try {
    const tokenInfo = await response.json();
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const g = new GmailReply(gmail, tokenInfo.email);
    await g.sendReply(threadId, mailBody.replaceAll("'", ""));
    await setReply(mailId, mailBody.replaceAll("'", ""));
    res.send();
  } catch (error) {
    console.log(error);
  }
});

app.get("/loadReply/:id", async (req, res) => {
  const result = await loadReply(req.params.id);
  res.send(result);
});

app.get("/mailData/:id", async (req, res) => {
  try {
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const id = req.params.id;
    const d: any = await getMailData(id, gmail);
    const e = await insertIfNotExists(id, d.date);
    // console.log(d);
    res.send({ ...d, read: e![0].read, resolved: e![0].resolved });
  } catch (e: any) {
    console.log(e);
    res.status(401).send(e);
  }
});

app.get("/toggleResolve/:id/:resolve", async (req, res) => {
  const { id, resolve } = req.params;
  const result = await toggleResolve(id, resolve == "0" ? 1 : 0);
  res.send(result);
});

app.get("/readMail/:id", async (req, res) => {
  try {
    const e = await readMail(req.params.id);
    res.status(200).send();
  } catch (error) {
    console.log(error);
  }
});

app.post("/getAiResponse", async (req, res) => {
  const { mailId, mailText } = req.body;
  var aiData = await getAiData(mailId);
  // console.log(aiData.recordset);
  try {
    if (aiData.recordset.length == 0) {
      const aiRes = await getOLLAMAResponse(
        categories.map((i) => i.label),
        mailText
      );
      console.log(aiRes);
      try {
        const categoryId = await saveAIData({ mailId: mailId, aiRes: aiRes });
        res.send({ mailId: mailId, categoryId, aiResponse: aiRes });
      } catch (error) {
        const aiRes = await getOLLAMAResponse(
          categories.map((i) => i.label),
          mailText + "give a string response for suggestedReply"
        );
        const categoryId = await saveAIData({ mailId: mailId, aiRes: aiRes });
        res.send({ mailId: mailId, categoryId, aiResponse: aiRes });
      }
    } else {
      res.send(aiData.recordset[0]);
    }
  } catch (e) {
    // console.warn(e);
    res.status(500).send(e);
  }
});

app.post("/regerateResponse", async (req, res) => {
  const { mailId, mailText, categoryId } = req.body;
  try {
    const aiRes = await getOLLAMAResponse(
      categories.map((i) => i.label),
      mailText
    );
    console.log(aiRes);
    await updateAIData({ aiRes, mailId, categoryId });
    res.send({ mailId: mailId, categoryId, aiResponse: aiRes });
  } catch (error) {
    console.log(error);
  }
});

app.get("/getNew/:historyId", async (req, res) => {
  const { historyId } = req.params;
  try {
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const result = await gmail.users.history.list({
      userId: "me",
      startHistoryId: historyId,
      labelIds: ["INBOX"], // Only get messages with INBOX label
      historyTypes: ["messageAdded"],
    } as  gmail_v1.Params$Resource$Users$History$List);
    res.send(result.data);
  } catch (error) {
    console.log(error);
  }
});

app.get("/getMailsByCategory/:id", async (req, res) => {
  const categoryId = req.params.id;
  const { pageNumber, max } = req.query;
  const result = await getCategoryMails(
    Number(categoryId),
    Number(pageNumber),
    Number(max)
  );
  res.send(result);
});

app.use("/categories", categoryRouter);

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("join", (data) => {
    console.log(data);
    console.log(data.email, "has joined");
    socket.join(data.email);
  });
});

app.post("/dashboard", async (req, res) => {
  const { startDate, endDate } = req.body;
  if (startDate && endDate) {
    const result = await getDashboardData(startDate, endDate);
    res.send(result);
  } else {
    res.status(404).send();
  }
});

app.post("/notification", async (req, res) => {
  console.log(req.body);
  const decodedData = JSON.parse(atob(req.body.message.data));
  io.sockets.in(decodedData.emailAddress).emit("notification", decodedData);
  res.status(200).send();
});

server.listen(3000, function () {
  console.log("listening");
});
