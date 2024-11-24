import { aiResponse, response } from "../models/aiResponse";
import { category } from "../models/category";
import { mail } from "../models/mail";
import {
  addCategory,
  addCategoryCount,
  descreaseCategoryCount,
  getCategory,
} from "./categoryDL";
import sql from "./init";

export const getAiData = async (mailId: string) => {
  const req = new sql.Request();
  req.input("mailId", mailId);
  const data = await req.batch<aiResponse>(
    `select * from MAIL_AIresponse where mailId=@mailId`
  );
  return data;
};

type saveAiType = {
  mailId: string;
  aiRes: string;
  categoryId?: number;
};

export const saveAIData = async ({ mailId, aiRes }: saveAiType) => {
  try {
    var category = await getCategory((JSON.parse(aiRes) as response).category);
    console.log(category);
    if (!category) {
      category = await addCategory((JSON.parse(aiRes) as response).category);
    }
    addCategoryCount(category.id);
    const req = new sql.Request();
    req.input("mailId", mailId);
    req.input("categoryId", category.id);
    req.input("aiResponse", aiRes);
    req.batch(
      `insert into MAIL_AIResponse (mailId, categoryId, aiResponse) values (@mailId, @categoryId, @aiResponse)`
    );
    return category.id;
  } catch (error) {
    console.log(error);
  }
};

export const updateAIData = async ({
  mailId,
  aiRes,
  categoryId,
}: saveAiType) => {
  try {
    var category = await getCategory((JSON.parse(aiRes) as response).category);
    console.log(category);
    if (!category) {
      category = await addCategory((JSON.parse(aiRes) as response).category);
    }
    const req = new sql.Request();
    req.input("mailId", mailId);
    req.input("categoryId", category.id);
    req.input("aiResponse", aiRes);
    req.batch(
      `update [MAIL_AIResponse] set categoryId=@categoryId, aiResponse=@aiResponse where mailId=@mailId`
    );
    addCategoryCount(category.id);
    if (categoryId) descreaseCategoryCount(categoryId);
    console.log(categoryId)
    return category.id;
    // Decrease previous category count
  } catch (error) {
    console.log(error);
  }
};

export const getCategoryMails = async (
  categoryId: number,
  pageNumber: number,
  max: number
) => {
  const res = new sql.Request();
  try {
    const result = await res.batch<mail>(
      `select mailId from MAIL_Category mc join MAIL_AIresponse mai on mc.id = mai.categoryId where categoryId=${categoryId} order by 1 OFFSET ${
        max * pageNumber
      } ROWS FETCH NEXT ${max} ROWS ONLY;`
    );
    return result.recordset;
  } catch (error) {
    return null;
  }
};
