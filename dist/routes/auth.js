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
const express_1 = __importDefault(require("express"));
const server_1 = require("../server");
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        server_1.oauth2Client.setCredentials({ access_token: access_token });
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
exports.default = router;
