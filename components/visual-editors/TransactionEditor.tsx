'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash } from 'lucide-react';

interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface TransactionEditorProps {
  value: Transaction[];
  onChange: (value: Transaction[]) => void;
}

export function TransactionEditor({ value, onChange }: TransactionEditorProps) {
  const handleAdd = () => {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Transaction',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };
    onChange([...value, newTransaction]);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((t) => t.id !== id));
  };

  const handleFieldChange = (id: string, field: keyof Transaction, fieldValue: any) => {
    onChange(
      value.map((t) =>
        t.id === id ? { ...t, [field]: fieldValue } : t
      )
    );
  };

  return (
    <div className="space-y-4">
      {value.map((transaction) => (
        <div key={transaction.id} className="flex gap-2 items-center p-2 rounded-md border">
          <div className="flex-1 space-y-2">
            <Input
              value={transaction.name}
              onChange={(e) => handleFieldChange(transaction.id, 'name', e.target.value)}
              placeholder="Name"
            />
            <Input
              type="number"
              value={transaction.amount}
              onChange={(e) => handleFieldChange(transaction.id, 'amount', Number(e.target.value))}
              placeholder="Amount"
            />
            <Input
              type="date"
              value={transaction.date}
              onChange={(e) => handleFieldChange(transaction.id, 'date', e.target.value)}
            />
            <select
              value={transaction.status}
              onChange={(e) => handleFieldChange(transaction.id, 'status', e.target.value)}
              className="p-2 w-full rounded-md border"
            >
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <Button variant="ghost" size="icon" onClick={() => handleRemove(transaction.id)}>
            <Trash className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button onClick={handleAdd}>Add Transaction</Button>
    </div>
  );
}