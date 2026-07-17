import express, { Request, Response } from 'express';
import cors from 'cors'; // Import CORS middleware to handle cross-origin requests
import pool from './db'; // Import our PostgreSQL connection

const app = express();
app.use(cors()); // Use CORS middleware
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming JSON payloads
app.use(express.json());

// 1. ROUTE TO FETCH ALL TRANSACTIONS (GET)
app.get('/api/transactions', async (req: Request, res: Response) => {
  try {
    // Select all rows from transactions table, sorted from newest to oldest
    const result = await pool.query('SELECT * FROM transactions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while fetching transactions" });
  }
});

// 2. ROUTE TO CREATE A NEW TRANSACTION (POST)
app.post('/api/transactions', async (req: Request, res: Response) => {
  try {
    const { description, amount, type, category } = req.body;

    // Simple validation: Ensure required fields are not empty
    if (!description || !amount || !type) {
       res.status(400).json({ error: "Please fill in all required fields (description, amount, type)" });
       return;
    }

    // Safely insert data using parameterized queries to prevent SQL Injection ($1, $2, etc.)
    const query = `
      INSERT INTO transactions (description, amount, type, category) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    const values = [description, amount, type, category || null];

    const result = await pool.query(query, values);
    
    // Return the newly created transaction from the database
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while creating the transaction" });
  }
});

// 3. ROUTE TO DELETE A TRANSACTION BY ID (DELETE)
app.delete('/api/transactions/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Get the transaction ID from the request parameters

    // Use a parameterized query to safely delete the transaction by ID
    // The "$1" is a placeholder for the ID value, which is passed as an array in the second argument to prevent SQL injection
    // The RETURNING * clause allows us to check if a row was actually deleted
    const deleteTransaction = await pool.query('DELETE FROM transactions WHERE id = $1 RETURNING *', [id]);

    //  Check if any rows were deleted; if not, return a 404 error
    if (deleteTransaction.rows.length === 0) {
      return res.status(404).json({ error: "Transaction not found" });
    }
    // 6. Return a success message if the transaction was deleted successfully
    res.json({ message: "Transaction deleted successfully", transaction: deleteTransaction.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "An error occurred while deleting the transaction" });
  }
});

// Start the server and listen on the configured port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});