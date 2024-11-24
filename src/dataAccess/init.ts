import sql from "mssql";

(async () => {
  try {
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect({
      server: process.env.SERVER as string,
      user: process.env.USER,
      password: process.env.Password,
      options: {
        trustedConnection: true,
        trustServerCertificate: true,
      },
      database:"mailai"
    });
    console.log("Connected to db");
  } catch (err) {
    // ... error checks
    console.log(err);
  }
})();

export default sql;
