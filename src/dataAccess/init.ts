import sql from "mssql";

(async () => {
  try {
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(process.env.DB_URL as string);
  } catch (err) {
    // ... error checks
  }
})();

export default sql;
