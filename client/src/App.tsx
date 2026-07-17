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

  // 2. CALCULATE FINANCIAL SUMMARY
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalBalance = totalIncome - totalExpenses;  

  // 3. Handle form submission (POST request)
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

  // 4. Handle item deletion (DELETE request)
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();

      if (response.ok) {
        // Filter the local state array to remove the deleted item instantly
        setTransactions(transactions.filter((t) => t.id !== id));
        console.log(data.message);
      } else {
        alert(data.message || "An error occurred while deleting");
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Budget Tracker 💰</h1>

      {/* FINANCIAL SUMMARY DASHBOARD */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        gap: '15px', 
        marginBottom: '30px' 
      }}>
        {/* Balance Card */}
        <div style={{ 
          flex: 1, 
          padding: '15px', 
          borderRadius: '8px', 
          background: totalBalance >= 0 ? '#e6f4ea' : '#fce8e6', 
          border: `1px solid ${totalBalance >= 0 ? '#137333' : '#c5221f'}`,
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#5f6368', fontWeight: 'bold' }}>Total Balance</span>
          <h2 style={{ margin: '5px 0 0 0', color: totalBalance >= 0 ? '#137333' : '#c5221f' }}>
            ${totalBalance.toFixed(2)}
          </h2>
        </div>

        {/* Income Card */}
        <div style={{ 
          flex: 1, 
          padding: '15px', 
          borderRadius: '8px', 
          background: '#f1f8e9', 
          border: '1px solid #689f38',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#5f6368', fontWeight: 'bold' }}>Income</span>
          <h2 style={{ margin: '5px 0 0 0', color: '#33691e' }}>
            +${totalIncome.toFixed(2)}
          </h2>
        </div>

        {/* Expense Card */}
        <div style={{ 
          flex: 1, 
          padding: '15px', 
          borderRadius: '8px', 
          background: '#fbe9e7', 
          border: '1px solid #ff5722',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#5f6368', fontWeight: 'bold' }}>Expenses</span>
          <h2 style={{ margin: '5px 0 0 0', color: '#bf360c' }}>
            -${totalExpenses.toFixed(2)}
          </h2>
        </div>
      </div>

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
                alignItems: 'center',
                padding: '10px', 
                borderBottom: '1px solid #eee',
                color: t.type === 'expense' ? '#dc3545' : '#28a745',
                fontWeight: '500'
              }}>
                <span><strong>{t.description}</strong> ({t.category || 'No Category'})</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <span>{t.type === 'expense' ? '-' : '+'}${Number(t.amount).toFixed(2)}</span>
                  
                  {/* Delete Button Component */}
                  <button 
                    onClick={() => t.id && handleDelete(t.id)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: '#dc3545', 
                      cursor: 'pointer', 
                      fontSize: '16px', 
                      fontWeight: 'bold', 
                      padding: '0 5px' 
                    }}
                    title="Delete transaction"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;