import express from "express";
import {
  addCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../dataAccess/categoryDL";
import { io, setCategories } from "../server";

const router = express.Router();

const getCats = async () => {
  const result = await getCategories();
  setCategories(result.recordset);
  return result;
};

router.get("/", async (req, res) => {
  const result = await getCats();
  res.send(result.recordset);
});

router.post("/", async (req, res) => {
  const { label } = req.body;
  try {
    const result = await addCategory(label);
    io.emit("dataChange", "category");
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.put("/", async (req, res) => {
  const { id, label } = req.body;
  const result = await updateCategory(id, label);
  io.emit("dataChange", "category");
  res.send(result.rowsAffected);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await deleteCategory(Number(id));
    io.emit("dataChange", "category");
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default router;
