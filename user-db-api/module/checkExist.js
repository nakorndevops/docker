// checkExist.js

/**
 * Checks if a user exists in the database by line_id.
 *
 * @param {object} pool - The database connection pool object (e.g., from mysql2).
 * @param {string} table - The database connection pool object (e.g., from mysql2).
 * @param {string} column - The database connection pool object (e.g., from mysql2).
 * @param {string} value - The unique ID of the user to check.
 * @returns {Promise<boolean>} - True if the user exists, false otherwise.
 * @throws {Error} - Throws an error if the database query fails.
 */
export async function checkExist(pool, table, column, value) {
    const query = `SELECT EXISTS (SELECT 1 FROM ${table} WHERE ${column} = ?) AS value_exist`;
    
    try {
        // The 'mysql2' library returns an array of result rows
        const [rows, fields] = await pool.execute(query, [value]);
        
        // The result is an array containing one object (the first row)
        const resultRow = rows[0]; 
        
        // Access the value using the alias 'value_exist'
        const existsValue = resultRow.value_exist;

        // existsValue will be 1 (true) or 0 (false)
        if (existsValue === 1) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        console.error("Database query failed:", error);
        throw error;
    }	
}