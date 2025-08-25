const { Pool } = require('pg');
const pool = new Pool({
  user: 'postgres',
  password: 'bader1234',
  database: 'school_db_3',
});

function checkRoles(allowedRoles) {
  return async (req, res, next) => {
    const user = await pool.query('SELECT role FROM users WHERE id = $1', [
      req.user.id,
    ]);

    try {
      if (!allowedRoles.includes(user.rows[0].role)) {
        return res.status(403).send('Insufficient permissions');
      }

      next();
    } catch (err) {
      res.status(400).send('Invalid token');
    }
  };
}
module.exports = { checkRoles };
