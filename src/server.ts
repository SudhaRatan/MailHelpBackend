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
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "./dataAccess/categoryDL";

const app = express();
const server = http.createServer(app);
const port = 3000;

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
  const { nextPageToken } = req.query;
  const gmail = google.gmail({ version: "v1", auth: oauth2Client });
  try {
    var r;
    r = await gmail.users.messages.list({
      userId: "me",
      maxResults: 20,
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

app.get("/categories", async (req, res) => {
  const result = await getCategories();
  res.send(result.recordset);
});

// Categories
app.post("/categories", async (req, res) => {
  const { label } = req.body;
  const result = await addCategory(label);
  res.send(result.rowsAffected);
});

app.put("/categories", async (req, res) => {
  const { id, label } = req.body;
  const result = await updateCategory(id, label);
  res.send(result.rowsAffected);
});

app.delete("/categories", async (req, res) => {
  const { id } = req.body;
  const result = await deleteCategory(id);
  res.send(result);
});

app.post("/notification", async (req, res) => {
  console.log(req.body);
  res.status(200).send();
});

server.listen(3000, function () {
  console.log("listening");
});
