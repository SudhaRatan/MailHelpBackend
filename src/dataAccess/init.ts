import sql from "mssql";

(async () => {
  try {
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(
      "Server=tcp:rocketf1.database.windows.net,1433;Initial Catalog=storedb;Persist Security Info=False;User ID=rocket;Password=Ratan@1112;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=60;"
    );
  } catch (err) {
    // ... error checks
  }
})();

export default sql;
