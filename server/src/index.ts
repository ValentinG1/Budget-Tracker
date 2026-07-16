import express, { Request, Response } from 'express';
import pool from './db'; // On importe notre connexion

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Route de test pour vérifier la connexion à la base de données
app.get('/api/test-db', async (req: Request, res: Response) => {
  try {
    // On fait une requête SQL très simple pour demander l'heure actuelle à PostgreSQL
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      message: "Connexion à PostgreSQL réussie !", 
      time: result.rows[0].now 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la connexion à la base de données." });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
