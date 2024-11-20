"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.REDIRECT_URL = exports.CLIENT_SECRET = exports.CLIENT_ID = void 0;
const path_1 = __importDefault(require("path"));
const googleapis_1 = require("googleapis");
const mailparser_1 = require("mailparser");
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const Auth_1 = require("./middlewares/Auth");
const MailUtils_1 = require("./utils/MailUtils");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const port = 3000;
app.use(body_parser_1.default.json());
// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path_1.default.join(process.cwd(), "src", "./token.json");
const CREDENTIALS_PATH = path_1.default.join(process.cwd(), "src", "./credentials.json");
exports.CLIENT_ID = process.env.CLIENT_ID;
exports.CLIENT_SECRET = process.env.CLIENT_SECRET;
exports.REDIRECT_URL = process.env.REDIRECT_URL;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth, index) {
    return __awaiter(this, void 0, void 0, function* () {
        const gmail = googleapis_1.google.gmail({ version: "v1", auth });
        const r = yield gmail.users.messages.list({ userId: "me" });
        console.log(r.data.messages);
        const res1 = gmail.users.messages.get({
            format: "raw",
            id: r.data.messages[index].id,
            userId: "me",
        });
        return new Promise((res, rej) => {
            res1
                .then((data) => __awaiter(this, void 0, void 0, function* () {
                if (data.data.raw) {
                    // Decode the Base64 URL-encoded email content
                    const decodedMessage = Buffer.from(data.data.raw, "base64url").toString("utf-8");
                    const result = yield (0, mailparser_1.simpleParser)(decodedMessage, {
                        decodeStrings: true,
                    });
                    res(result);
                }
            }))
                .catch((error) => {
                console.error("Error fetching the message:", error);
            });
        });
    });
}
const corsOptions = {
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
const oauth2Client = new googleapis_1.google.auth.OAuth2(exports.CLIENT_ID, exports.CLIENT_SECRET, exports.REDIRECT_URL);
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
app.post("/api/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { access_token } = req.body;
    try {
        const response = yield fetch("https://oauth2.googleapis.com/tokeninfo", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `access_token=${access_token}`,
        });
        const tokenInfo = yield response.json();
        console.log(tokenInfo);
        oauth2Client.setCredentials({ access_token: access_token });
        // const response = await gmail.users.messages.list({ userId: 'me' });
        res.json({
            success: true,
            message: "Logged in successfully",
            data: tokenInfo,
        });
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}));
app.get("/getMails", Auth_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = googleapis_1.google.gmail({ version: "v1", auth: oauth2Client });
    const r = yield gmail.users.messages.list({ userId: "me", maxResults: 20 });
    console.log(r.data);
    res.send(r.data);
}));
app.get("/mailData/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const gmail = googleapis_1.google.gmail({ version: "v1", auth: oauth2Client });
        const id = req.params.id;
        const d = yield (0, MailUtils_1.getMailData)(id, gmail);
        res.send(d);
    }
    catch (e) {
        console.log(e);
        res.status(401).send(e);
    }
}));
server.listen(3000, function () {
    console.log("listening");
});
