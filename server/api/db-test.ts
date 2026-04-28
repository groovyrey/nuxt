export default defineEventHandler(async (event) => {
  try {
    const db = useDb();
    const [rows] = await db.query('SELECT 1 as connection_test');
    return {
      status: 'success',
      message: 'Database connection established',
      data: rows
    };
  } catch (error: any) {
    return {
      status: 'error',
      message: error.message,
      hint: 'Ensure your environment variables match your Aiven console credentials.'
    };
  }
});
