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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMailData = void 0;
const mailparser_1 = require("mailparser");
const getMailData = (id, gmail) => {
    const res1 = gmail.users.messages.get({
        format: "raw",
        id: id,
        userId: "me",
    });
    return new Promise((res, rej) => {
        res1
            .then((data) => __awaiter(void 0, void 0, void 0, function* () {
            if (data.data.raw) {
                // console.log(data.data)
                // Decode the Base64 URL-encoded email content
                const decodedMessage = Buffer.from(data.data.raw, "base64url").toString("utf-8");
                const result = yield (0, mailparser_1.simpleParser)(decodedMessage, {
                    decodeStrings: true,
                });
                res(Object.assign(Object.assign({}, result), { snippet: data.data.snippet }));
            }
        }))
            .catch((error) => {
            console.error("Error fetching the message:", error);
            rej(error);
        });
    });
};
exports.getMailData = getMailData;
