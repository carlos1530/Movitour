import { Pool } from "pg";

export const connection_db_pg = new Pool({
  host: "localhost",
  user: "vega",
  password: "1234",
  database: "proyecto_integrador",
  port: 3000, // Debe ser número
  max: 10,
});

const testConnection = async () => {
  let connection;
  try {
    connection = await connection_db_pg.connect();
    console.log("✅ Base de datos conectada correctamente");
  } catch (error) {
    console.error(`❌ Error al conectar la base de datos: ${error.message}`);
  } finally {
    if (connection) connection.release();
  }
};

testConnection();