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
exports.deleteCategory = exports.updateCategory = exports.addCategory = exports.getCategories = void 0;
const init_1 = __importDefault(require("./init"));
const getCategories = () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield init_1.default.query(`select * from [MAIL_Category]`);
    return res;
});
exports.getCategories = getCategories;
const addCategory = (label) => __awaiter(void 0, void 0, void 0, function* () {
    const request = new init_1.default.Request();
    request.input("label", label);
    const response = yield request.query("insert into [MAIL_Category] (label) values (@label)");
    return response;
});
exports.addCategory = addCategory;
const updateCategory = (id, label) => __awaiter(void 0, void 0, void 0, function* () {
    const request = new init_1.default.Request();
    request.input("id", id);
    request.input("label", label);
    const response = yield request.query("update [MAIL_Category] set label=@label where id=@id");
    return response;
});
exports.updateCategory = updateCategory;
const deleteCategory = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield init_1.default.query(`delete from [MAIL_Category] where id=${id}`);
    return res;
});
exports.deleteCategory = deleteCategory;
