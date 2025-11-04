"use client";

import { useArtifactsStore } from "@/store/artifacts";
import { ArtifactPreviewDrawer } from "@/components/tambo/artifact-preview-drawer";

export default function TestArtifactPage() {
  const { openPreview, add } = useArtifactsStore();

  const createFinanceApp = () => {
    const id = `art-finance-${Date.now()}`;
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Finance App</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f6f6f9; padding: 30px; }
        .finance-app { background: white; border-radius: 8px; padding: 24px; max-width: 400px; margin: auto; box-shadow: 0 4px 16px #0001; }
        h2 { text-align: center; }
        label { display: block; margin-top: 12px; }
        input, select, button { width: 100%; padding: 8px; margin-top: 4px; border-radius: 4px; border: 1px solid #ccc; font-size: 1em; }
        button { background: #3b82f6; color: white; margin-top: 16px; cursor: pointer; }
        button:hover { background: #2563eb; }
        table { width: 100%; margin-top: 24px; border-collapse: collapse; }
        th, td { padding: 8px; text-align: center; border-bottom: 1px solid #eee; }
        th { background: #f1f5f9; }
    </style>
</head>
<body>
<div class="finance-app">
    <h2>Finance Tracker</h2>
    <form id="finance-form" onsubmit="return false;">
        <label>Income:
            <input type="number" id="income" min="0" required>
        </label>
        <label>Expenses:
            <input type="number" id="expenses" min="0" required>
        </label>
        <label>Category:
            <select id="category" required>
                <option value="Salary">Salary</option>
                <option value="Investments">Investments</option>
                <option value="Groceries">Groceries</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
            </select>
        </label>
        <button onclick="addEntry()">Add Entry</button>
    </form>
    <table id="entries">
        <thead>
            <tr>
                <th>Income</th>
                <th>Expenses</th>
                <th>Category</th>
                <th>Balance</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    </table>
</div>
<script>
function addEntry() {
    const income = parseFloat(document.getElementById('income').value);
    const expenses = parseFloat(document.getElementById('expenses').value);
    const category = document.getElementById('category').value;
    if (isNaN(income) || isNaN(expenses)) return;
    const balance = income - expenses;
    const tbody = document.getElementById('entries').getElementsByTagName('tbody')[0];
    const row = tbody.insertRow();
    row.insertCell().textContent = income;
    row.insertCell().textContent = expenses;
    row.insertCell().textContent = category;
    row.insertCell().textContent = balance;
    document.getElementById('finance-form').reset();
}
</script>
</body>
</html>`;

    add({
      id,
      type: "code/html",
      title: "Finance Tracker App",
      payload: { html },
      createdAt: Date.now(),
    });
    openPreview(id);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Artifact Preview Test</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Click the button below to create and preview your finance app artifact.
          This works independently of the Tambo API.
        </p>
        
        <button
          onClick={createFinanceApp}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg font-medium"
        >
          Create & Preview Finance App
        </button>
      </div>
      
      <ArtifactPreviewDrawer />
    </div>
  );
}
