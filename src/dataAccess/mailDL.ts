import { mail } from "../models/mail";
import sql from "./init";

export const insertIfNotExists = async (id: string, date:string) => {
  const d = new Date(date)
  const req = new sql.Request();
  try {
    const result = await req.batch<mail>(
      `begin if not exists (select * from mail_emailmetadata where id='${id}') begin insert into mail_emailmetadata (id, [read], resolved, sentReply, date) values ('${id}', 0, 0, '', '${d.toISOString().split('T')[0]+' '+d.toTimeString().split(' ')[0]}') end select * from mail_emailmetadata where id='${id}' end`
    );
    return result.recordset;
  } catch (error) {
    console.error(error);
  }
};

export const readMail = async (id: string) => {
  const res = await sql.query(
    `update mail_emailmetadata set [read]=1 where id='${id}'`
  );
};

export const setReply = async (id: string, mailBody: string) => {
  const res = await sql.query(
    `update mail_emailmetadata set sentReply='${mailBody}' where id='${id}'`
  );
};

export const loadReply = async (id: string) => {
  const res = await sql.query<mail>(
    `select * from mail_emailmetadata where id='${id}'`
  );
  return res.recordset;
};

export const toggleResolve = async (id: string, resolve: number) => {
  const res = await sql.query(
    `update mail_emailmetadata set resolved=${resolve} where id='${id}'`
  );
  return res
};

export const getDashboardData = async(startDate:string,endDate:string) => {
  const d = new Date(startDate)
  const d1 = new Date(endDate)
  const res = await sql.query(`select count(resolved) [Count], resolved, [label] from mail_emailmetadata md join mail_airesponse ai on md.id = ai.mailId join mail_category c on c.id = ai.categoryId where date between '${d.toISOString().split('T')[0]+' '+d.toTimeString().split(' ')[0]}' and '${d1.toISOString().split('T')[0]+' '+d1.toTimeString().split(' ')[0]}' group by resolved,label`)
  return res
}