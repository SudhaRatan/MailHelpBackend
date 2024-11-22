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

const app = express();
const server = http.createServer(app);
const port = 3000;

const io = new Server(server, { cors: { origin: "*" } });

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
  await gmail.users.stop({ userId: "me" });
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
    } as gmail_v1.Params$Resource$Users$Messages$List);
    // console.log(r.data);
    res.send(r.data);
  } catch (error) {
    console.log(error);
    res.status(401).send();
  }
});

app.get("/mailData/:id", async (req, res) => {
  try {
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    const id = req.params.id;
    const d = await getMailData(id, gmail);
    res.send(d);
  } catch (e: any) {
    console.log(e);
    res.status(401).send(e);
  }
});

app.get("/getNew/:historyId", async (req, res) => {
  const { historyId } = req.params;
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  const result = await gmail.users.history.list({
    userId: "me",
    startHistoryId: historyId,
  });
  res.send(result.data);
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

app.post("/notification", async (req, res) => {
  console.log(req.body);
  const decodedData = JSON.parse(atob(req.body.message.data));
  io.sockets.in(decodedData.emailAddress).emit("notification", decodedData);
  res.status(200).send();
});

server.listen(3000, function () {
  console.log("listening");
});
