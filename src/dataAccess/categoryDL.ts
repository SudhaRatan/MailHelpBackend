import { category } from "../models/category";
import { io } from "../server";
import sql from "./init";

export const getCategories = async () => {
  const r = new sql.Request();
  const res = await r.batch<category>(`select * from [MAIL_Category]`);
  return res;
};

export const getCategory = async (label: string) => {
  const result = new sql.Request();
  result.input("label", label);
  try {
    const res = await result.batch<category>(
      `select * from [MAIL_Category] where label=@label`
    );
    return res.recordset[0];
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const addCategory = async (label: string) => {
  const request = new sql.Request();
  request.input("label", label);
  await request.batch("insert into [MAIL_Category] (label) values (@label)");
  const req1 = new sql.Request();
  const r = await req1.batch<category>(
    `select * from [MAIL_Category] where label='${label}'`
  );
  return r.recordset[0];
};

export const updateCategory = async (id: number, label: string) => {
  const request = new sql.Request();
  request.input("id", id);
  request.input("label", label);
  const response = await request.batch(
    "update [MAIL_Category] set label=@label where id=@id"
  );
  return response;
};

export const deleteCategory = async (id: number) => {
  const r = new sql.Request();
  const res = await r.batch(`delete from [MAIL_Category] where id=${id}`);
  return res;
};

export const addCategoryCount = async (id: number) => {
  const r = new sql.Request();
  await r.batch(`update MAIL_Category set count = count + 1 where id = ${id}`);
  io.emit("dataChange", "category");
};

export const descreaseCategoryCount = async (id: number) => {
  const r = new sql.Request();
  await r.batch(`update MAIL_Category set count = count - 1 where id = ${id}`);
  io.emit("dataChange", "category");
};
