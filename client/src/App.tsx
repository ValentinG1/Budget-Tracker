import React, { useState, useEffect } from 'react';

// Define what a Transaction looks like (TypeScript interface)
interface Transaction {
  id?: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  created_at?: string;
}

function App() {
  // State to store the list of transactions
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // State for form fields
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');

  const API_URL = 'http://localhost:5000/api/transactions';

  // 1. Fetch transactions from backend when the app loads
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // 2. Handle form submission (POST request)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount) {
      alert("Please fill in description and amount");
      return;
    }

    const newTransaction: Transaction = {
      description,
      amount: parseFloat(amount),
      type,
      category
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTransaction),
      });

      if (response.ok) {
        // Reset form fields
        setDescription('');
        setAmount('');
        setCategory('');
        // Refresh the list to show the new transaction
        fetchTransactions();
      } else {
        console.error("Server returned an error");
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Budget Tracker 💰</h1>

      {/* Form Section */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
        <h3>Add New Transaction</h3>
        <input 
          type="text" 
          placeholder="Description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="number" 
          placeholder="Amount" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value as 'income' | 'expense')}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="expense">Expense (-)</option>
          <option value="income">Income (+)</option>
        </select>
        <input 
          type="text" 
          placeholder="Category (e.g. Food, Salary)" 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ cursor: 'pointer', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>
          Add Transaction
        </button>
      </form>

      {/* List Section */}
      <div>
        <h3>Transactions History</h3>
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {transactions.map((t) => (
              <li key={t.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '10px', 
                borderBottom: '1px solid #eee',
                color: t.type === 'expense' ? '#dc3545' : '#28a745',
                fontWeight: '500'
              }}>
                <span><strong>{t.description}</strong> ({t.category || 'No Category'})</span>
                <span>{t.type === 'expense' ? '-' : '+'}${Number(t.amount).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;