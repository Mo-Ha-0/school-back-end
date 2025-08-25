
const {Pool}=require('pg');
const pool = new Pool({ user: 'postgres', password: 'bader1234', database: 'school_db_3' });

const adminMiddleware = async (req, res, next) => {
    const user = await pool.query('SELECT role FROM users WHERE id = $1', [req.userId]);
    if (user.rows[0].role !== 'admin') {
      return res.status(403).send('Access denied. Admins only.');
    }
    next();
  };
  module.exports = adminMiddleware;