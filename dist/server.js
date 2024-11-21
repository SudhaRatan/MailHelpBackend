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
const googleapis_1 = require("googleapis");
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const Auth_1 = require("./middlewares/Auth");
const MailUtils_1 = require("./utils/MailUtils");
const categoryDL_1 = require("./dataAccess/categoryDL");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const port = 3000;
app.use(body_parser_1.default.json());
exports.CLIENT_ID = process.env.CLIENT_ID;
exports.CLIENT_SECRET = process.env.CLIENT_SECRET;
exports.REDIRECT_URL = process.env.REDIRECT_URL;
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";
const corsOptions = {
    origin: "*",
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};
app.use((0, cors_1.default)(corsOptions));
const oauth2Client = new googleapis_1.google.auth.OAuth2(exports.CLIENT_ID, exports.CLIENT_SECRET, exports.REDIRECT_URL);
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
    const { nextPageToken } = req.query;
    const gmail = googleapis_1.google.gmail({ version: "v1", auth: oauth2Client });
    try {
        var r;
        r = yield gmail.users.messages.list({ userId: "me", maxResults: 20, pageToken: nextPageToken });
        // console.log(r.data);
        res.send(r.data);
    }
    catch (error) {
        console.log(error);
        res.status(401).send();
    }
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
app.get("/categories", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, categoryDL_1.getCategories)();
    res.send(result.recordset);
}));
server.listen(3000, function () {
    console.log("listening");
});
