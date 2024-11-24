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
exports.saveAIData = exports.getAiData = void 0;
const categoryDL_1 = require("./categoryDL");
const init_1 = __importDefault(require("./init"));
const getAiData = (mailId) => __awaiter(void 0, void 0, void 0, function* () {
    const req = new init_1.default.Request();
    req.input("mailId", mailId);
    const data = yield req.query(`select * from MAIL_AIresponse where mailId=@mailId`);
    return data;
});
exports.getAiData = getAiData;
const saveAIData = (_a) => __awaiter(void 0, [_a], void 0, function* ({ mailId, aiRes }) {
    var category = yield (0, categoryDL_1.getCategory)(JSON.parse(aiRes).category);
    console.log(category);
    if (!category) {
        category = yield (0, categoryDL_1.addCategory)(JSON.parse(aiRes).category);
    }
    (0, categoryDL_1.addCategoryCount)(category.id);
    init_1.default.query(`insert into MAIL_AIResponse (mailId, categoryId, aiResponse) values ('${mailId}', ${category.id}, '${aiRes}')`);
    return category.count;
});
exports.saveAIData = saveAIData;
