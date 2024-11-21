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
const Auth_1 = require("../middlewares/Auth");
const router = express_1.default.Router();
router.get("/mailData/:id", Auth_1.verifyToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const gmail = server_1.google.gmail({ version: "v1", auth: server_1.oauth2Client });
    try {
        const r = yield gmail.users.messages.list({ userId: "me", maxResults: 20 });
        console.log(r.data);
        res.send(r.data);
    }
    catch (error) {
        res.status(401).send();
    }
}));
router.get("/getMails", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Hit");
    const gmail = server_1.google.gmail({ version: "v1", auth: server_1.oauth2Client });
    try {
        const r = yield gmail.users.messages.list({ userId: "me", maxResults: 20 });
        console.log(r.data);
        res.send(r.data);
    }
    catch (error) {
        res.status(401).send();
    }
}));
exports.default = router;
