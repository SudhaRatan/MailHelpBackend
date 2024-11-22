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
const mssql_1 = __importDefault(require("mssql"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // make sure that any items are correctly URL encoded in the connection string
        yield mssql_1.default.connect({
            server: process.env.SERVER,
            user: process.env.USER,
            password: process.env.Password,
            options: {
                trustedConnection: true,
                trustServerCertificate: true,
            },
        });
        console.log("Connected to db");
    }
    catch (err) {
        // ... error checks
        console.log(err);
    }
}))();
exports.default = mssql_1.default;
