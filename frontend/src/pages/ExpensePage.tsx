import { useQuery } from '@tanstack/react-query';
import { fetchExpenses } from '../services/api';
import ExpenseForm from '../components/ExpenseForm';
import DefaultLayout from '../components/DefaultLayout';

export default function ExpensePage() {
  const { data: expenses = [], isLoading, isError } = useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses
  });

  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <DefaultLayout>
      <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-text-main">Financial Outgoings</h1>
            <p className="text-text-muted mt-1">Track and manage business expenses.</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-muted">Total Recorded Expenses</p>
            <p className="text-2xl font-bold text-primary">
              ₱ {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ExpenseForm />
          </div>
          
          <div className="md:col-span-2 bg-surface border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border bg-surface-hover">
              <h2 className="text-lg font-semibold text-text-main">Recent Expenses</h2>
            </div>
            
            <div className="overflow-y-auto flex-1 p-0">
              {isLoading && <p className="p-4 text-text-muted">Loading financial records...</p>}
              {isError && <p className="p-4 text-red-400">Failed to load records.</p>}
              
              {!isLoading && !isError && expenses.length === 0 && (
                <p className="p-4 text-text-muted text-center mt-8">No expenses recorded yet.</p>
              )}

              {!isLoading && expenses.length > 0 && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-sm text-text-muted">
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Description</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr key={expense._id} className="border-b border-border hover:bg-surface-hover transition-colors">
                        <td className="p-4 text-sm text-text-muted">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm text-text-main">{expense.description}</td>
                        <td className="p-4 text-sm">
                          <span className="bg-background px-2 py-1 rounded text-xs text-text-muted border border-border">
                            {expense.category}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-medium text-text-main text-right">
                          ₱ {expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

      </div>
    </DefaultLayout>
  );
}