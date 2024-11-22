import express from "express"
import { addCategory, deleteCategory, getCategories, updateCategory } from "../dataAccess/categoryDL";

const router = express.Router()

router.get("/", async (req, res) => {
  const result = await getCategories();
  res.send(result.recordset);
});

router.post("/", async (req, res) => {
  const { label } = req.body;
  const result = await addCategory(label);
  res.send(result.rowsAffected);
});

router.put("/", async (req, res) => {
  const { id, label } = req.body;
  const result = await updateCategory(id, label);
  res.send(result.rowsAffected);
});

router.delete("/", async (req, res) => {
  const { id } = req.body;
  const result = await deleteCategory(id);
  res.send(result);
});

export default router