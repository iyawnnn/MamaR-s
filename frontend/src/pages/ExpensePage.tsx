import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchExpenses, createExpense } from "@/services/api";
import { formatPHP } from "@/utils/currency";
import { Plus, Wallet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ExpensePage() {
  const queryClient = useQueryClient();
  
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category: "Ingredients"
  });

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses
  });

  const expenseMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      setExpenseForm({ description: "", amount: "", category: "Ingredients" });
    }
  });

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.description || !expenseForm.amount) return;
    expenseMutation.mutate({
      ...expenseForm,
      amount: Number(expenseForm.amount)
    });
  };

  const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

  return (
    <div className="space-y-8 p-8 pt-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-border/40">
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl tracking-tight font-black text-foreground font-serif">
            Outflows Ledger
          </h1>
          <p className="text-muted-foreground font-sans text-sm font-medium">
            Record and monitor operational expenditures.
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Lifetime Expenditure</p>
          <p className="text-3xl font-black text-primary mt-1">
            {formatPHP(totalExpenses)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-card rounded-3xl border border-border/40 p-6 shadow-sm self-start">
          <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Plus className="w-4 h-4 text-primary" /> Log Expense
          </h3>
          <form onSubmit={handleExpenseSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</Label>
              <Input 
                required 
                value={expenseForm.description}
                onChange={e => setExpenseForm({...expenseForm, description: e.target.value})}
                placeholder="e.g. Utility Bill" 
                className="h-12 bg-muted/20 border-border/40 font-bold" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount</Label>
                <Input 
                  required 
                  type="number" 
                  value={expenseForm.amount}
                  onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})}
                  className="h-12 bg-muted/20 border-border/40 font-bold" 
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</Label>
                <select 
                  value={expenseForm.category}
                  onChange={e => setExpenseForm({...expenseForm, category: e.target.value})}
                  className="w-full h-12 px-3 rounded-xl border border-border/40 bg-muted/20 font-bold text-sm outline-none focus:border-primary"
                >
                  <option>Ingredients</option>
                  <option>Packaging</option>
                  <option>Utilities</option>
                  <option>Equipment</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <Button type="submit" disabled={expenseMutation.isPending} className="w-full h-12 mt-4 bg-foreground text-background hover:bg-foreground/90 font-black rounded-xl text-[10px] uppercase tracking-widest">
              {expenseMutation.isPending ? "Processing..." : "Commit Record"}
            </Button>
          </form>
        </div>

        <div className="xl:col-span-2 bg-card rounded-3xl border border-border/40 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border/40 bg-muted/10 flex justify-between items-center">
            <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em] flex items-center gap-2">
               <Wallet className="w-4 h-4 text-muted-foreground" /> Recorded Outflows
            </h3>
          </div>
          
          <div className="overflow-x-auto max-h-[600px]">
            {isLoading ? (
               <div className="flex justify-center items-center py-12">
                 <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
               </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-muted-foreground uppercase font-black bg-background border-b border-border/40 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 bg-card">
                  {expenses.slice().reverse().map((e: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 text-[10px] font-black uppercase text-muted-foreground">{new Date(e.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-foreground text-sm">{e.description}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-muted/30 border border-border/40 text-[10px] uppercase tracking-widest font-black rounded-md text-foreground">{e.category}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-destructive text-sm">{formatPHP(e.amount)}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-12 text-muted-foreground text-xs font-bold">No financial records found.</td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}