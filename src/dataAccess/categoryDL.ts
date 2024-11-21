import { category } from "../models/category";
import sql from "./init";

export const getCategories = async () => {
  const res = await sql.query<category>(`select * from [MAIL_Category]`);
  return res;
};

export const addCategory = async (label: string) => {
  const request = new sql.Request();
  request.input("label", label);
  const response = await request.query(
    "insert into [MAIL_Category] (label) values (@label)"
  );
  return response;
};

export const updateCategory = async (id: number, label: string) => {
  const request = new sql.Request();
  request.input("id", id);
  request.input("label", label);
  const response = await request.query(
    "update [MAIL_Category] set label=@label where id=@id"
  );
  return response;
};

export const deleteCategory = async (id: number) => {
  const res = await sql.query(`delete from [MAIL_Category] where id=${id}`);
  return res;
};
