// utils/dbHelpers.js

/**
 * Checks if a value exists in a specific table and column.
 *
 * @param {object} pool - The mysql2 connection pool.
 * @param {string} table - The name of the database table (e.g., 'user').
 * @param {string} column - The name of the column to check (e.g., 'LineUserId').
 * @param {string|number} value - The value to search for.
 * @returns {Promise<boolean>} - True if the value exists, false otherwise.
 * @throws {Error} - Throws an error if the database query fails.
 */
export async function checkExist(pool, table, column, value) {
  // Using backticks to safely escape table/column names
  const query = `SELECT EXISTS (SELECT 1 FROM \`${table}\` WHERE \`${column}\` = ?) AS value_exist`;

  try {
    const [rows] = await pool.execute(query, [value]);
    
    // rows[0].value_exist will be 1 (true) or 0 (false)
    return rows[0].value_exist === 1;

  } catch (error) {
    console.error("Database query failed in checkExist:", error);
    throw error; // Re-throw to be caught by the route handler
  }
}