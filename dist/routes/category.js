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
const categoryDL_1 = require("../dataAccess/categoryDL");
const router = express_1.default.Router();
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, categoryDL_1.getCategories)();
    res.send(result.recordset);
}));
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { label } = req.body;
    const result = yield (0, categoryDL_1.addCategory)(label);
    res.send(result.rowsAffected);
}));
router.put("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, label } = req.body;
    const result = yield (0, categoryDL_1.updateCategory)(id, label);
    res.send(result.rowsAffected);
}));
router.delete("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    const result = yield (0, categoryDL_1.deleteCategory)(id);
    res.send(result);
}));
exports.default = router;
