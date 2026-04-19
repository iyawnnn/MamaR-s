import React, { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from "@/services/api";
import { formatPHP } from "@/utils/currency";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Plus,
  Wallet,
  TrendingDown,
  CalendarDays,
  CreditCard,
  LayoutGrid,
  Receipt,
  Tag,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface IExpense {
  _id?: string;
  description: string;
  amount: number;
  category: string;
  date: string | Date;
}

const CATEGORIES = [
  "Ingredients",
  "Packaging",
  "Utilities",
  "Equipment",
  "Other",
];

const INITIAL_FORM_STATE = {
  description: "",
  amount: "",
  category: "Ingredients",
};

export default function ExpensePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const [expenseForm, setExpenseForm] = useState(INITIAL_FORM_STATE);

  const { data: expenses = [], isLoading } = useQuery<IExpense[]>({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  const createMutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<IExpense> }) => updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setExpenseForm(INITIAL_FORM_STATE);
      setEditingId(null);
    }, 200);
  };

  const handleEditClick = (expense: IExpense) => {
    setEditingId(expense._id as string);
    setExpenseForm({
      description: expense.description,
      amount: expense.amount.toString(),
      category: expense.category,
    });
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setExpenseToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    if (expenseToDelete) {
      deleteMutation.mutate(expenseToDelete);
    }
  };

  const handleExpenseSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!expenseForm.description || !expenseForm.amount) return;

      const payload = {
        ...expenseForm,
        amount: Number(expenseForm.amount),
      };

      if (editingId) {
        updateMutation.mutate({ id: editingId, data: payload });
      } else {
        createMutation.mutate(payload);
      }
    },
    [expenseForm, editingId, createMutation, updateMutation]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const todayStr = now.toDateString();

    let thisMonthTotal = 0;
    let todayTotal = 0;
    const categoryTotals: Record<string, number> = {};

    expenses.forEach((exp) => {
      const expDate = new Date(exp.date);

      if (
        expDate.getMonth() === currentMonth &&
        expDate.getFullYear() === currentYear
      ) {
        thisMonthTotal += exp.amount;
      }
      if (expDate.toDateString() === todayStr) {
        todayTotal += exp.amount;
      }

      categoryTotals[exp.category] =
        (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const topCategory =
      Object.keys(categoryTotals).length > 0
        ? Object.keys(categoryTotals).reduce((a, b) =>
            categoryTotals[a] > categoryTotals[b] ? a : b,
          )
        : "N/A";

    return {
      thisMonthTotal,
      todayTotal,
      topCategory,
      totalCount: expenses.length,
    };
  }, [expenses]);

  const filteredData = useMemo(() => {
    if (activeTab === "all") return expenses;
    return expenses.filter(
      (e) => e.category.toLowerCase() === activeTab.toLowerCase(),
    );
  }, [expenses, activeTab]);

  const columns = useMemo<ColumnDef<IExpense>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-[10px] font-black uppercase text-muted-foreground">
            {new Date(row.original.date).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <span className="font-bold text-foreground text-sm">
            {row.original.description}
          </span>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="px-2 py-1 bg-muted/30 border border-border/40 text-[10px] uppercase tracking-widest font-black rounded-md text-foreground">
            {row.original.category}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => (
          <div className="text-right font-black text-foreground text-sm">
            {formatPHP(row.original.amount)}
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEditClick(row.original)}
              className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteRequest(row.original._id as string)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl font-serif font-black text-primary tracking-tighter leading-none">
            Outflows Ledger
          </h1>
          <p className="text-muted-foreground font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Track and manage operational expenditures.
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={(open) => {
          if (!open) closeModal();
          else setIsModalOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button className="group h-14 pl-6 pr-2 rounded-full bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-lg flex items-center gap-4 border-none">
              <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                Log Expense
              </span>
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
                <Plus className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px] p-0 border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl gap-0">
            <div className="p-8 border-b border-border/40 bg-muted/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                <Wallet className="w-32 h-32 text-foreground" />
              </div>
              <DialogHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-primary" />
                  </div>
                  <DialogTitle className="text-2xl font-serif font-black tracking-tight text-foreground">
                    {editingId ? "Modify Outflow" : "Record Outflow"}
                  </DialogTitle>
                </div>
                <DialogDescription className="text-xs font-medium text-muted-foreground">
                  {editingId ? "Update existing ledger entry details." : "Execute a new ledger entry. Ensure the correct classification is selected."}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-8">
              <form
                id="expense-form"
                onSubmit={handleExpenseSubmit}
                className="space-y-8"
              >
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <TrendingDown className="w-3 h-3 text-primary" />
                    Expenditure Amount
                  </Label>
                  <div className="relative flex items-center bg-transparent border border-border/40 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-xl transition-all h-14 px-4 overflow-hidden group">
                    <span className="text-xl font-black text-muted-foreground group-focus-within:text-primary transition-colors select-none">
                      ₱
                    </span>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={expenseForm.amount}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          amount: e.target.value,
                        })
                      }
                      className="flex-1 w-full bg-transparent border-none text-xl font-black text-foreground outline-none focus:outline-none focus:ring-0 p-0 shadow-none placeholder:text-muted/30 h-full pl-3 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Transaction Descriptor
                    </Label>
                    <Input
                      required
                      value={expenseForm.description}
                      onChange={(e) =>
                        setExpenseForm({
                          ...expenseForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="e.g. Electric Bill"
                      className="h-12 bg-muted/20 border-border/40 font-bold focus-visible:ring-primary focus-visible:ring-offset-0 transition-all rounded-xl text-sm"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Tag className="w-3 h-3" />
                      Classification
                    </Label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setExpenseForm({ ...expenseForm, category: cat })
                          }
                          className={`h-10 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                            expenseForm.category === cat
                              ? "bg-foreground text-background border-foreground shadow-sm"
                              : "bg-muted/10 text-muted-foreground border-border/40 hover:bg-muted/30 hover:text-foreground"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-border/40 bg-muted/5">
              <Button
                type="submit"
                form="expense-form"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full h-14 bg-primary text-white hover:bg-primary/90 font-black rounded-xl text-[11px] uppercase tracking-widest transition-all shadow-lg"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Executing..."
                  : (editingId ? "Commit Updates" : "Commit Transaction")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "This Month",
            value: formatPHP(stats.thisMonthTotal),
            icon: CalendarDays,
          },
          {
            label: "Today",
            value: formatPHP(stats.todayTotal),
            icon: TrendingDown,
          },
          { label: "Top Category", value: stats.topCategory, icon: CreditCard },
          {
            label: "Total Entries",
            value: stats.totalCount.toString(),
            icon: Wallet,
          },
        ].map((kpi, idx) => (
          <div
            key={idx}
            className="flex flex-col p-6 rounded-xl border border-border/60 bg-card relative overflow-hidden shadow-sm"
          >
            <kpi.icon
              className="absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.04] text-foreground"
              aria-hidden="true"
            />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] relative z-10">
              {kpi.label}
            </span>
            <span className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter relative z-10 text-foreground truncate">
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      <Tabs
        defaultValue="all"
        className="space-y-6"
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-muted/40 p-1.5 rounded-xl w-fit h-auto flex flex-wrap gap-2 border border-border/40">
          {[
            { id: "all", label: "All Records" },
            { id: "ingredients", label: "Ingredients" },
            { id: "packaging", label: "Packaging" },
            { id: "utilities", label: "Utilities" },
            { id: "equipment", label: "Equipment" },
          ].map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              className="rounded-lg px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:border-border/40 text-muted-foreground hover:text-foreground border border-transparent"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/20 border-b border-border/40">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-none"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground h-16 px-6"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="divide-y divide-border/20">
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <span className="text-sm font-semibold tracking-tight animate-pulse">
                        Syncing ledger records...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-none hover:bg-muted/10 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-5 px-6 align-middle"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-48 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <LayoutGrid className="w-8 h-8 mb-4 opacity-20" />
                      <span className="text-sm font-semibold tracking-tight">
                        No expenses match this category.
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between px-8 py-5 border-t border-border/40 bg-muted/5">
            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
              Page{" "}
              <span className="text-foreground">
                {table.getState().pagination.pageIndex + 1}
              </span>{" "}
              of {table.getPageCount() || 1}
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-9 px-4 text-[10px] uppercase font-bold tracking-widest rounded-lg border-border/40 hover:bg-muted/20"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-9 px-4 text-[10px] uppercase font-bold tracking-widest rounded-lg border-border/40 hover:bg-muted/20"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </Tabs>

      {isDeleteModalOpen && expenseToDelete && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border/40 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-2xl text-foreground tracking-tight">Remove Ledger Entry</h3>
                <p className="text-sm text-muted-foreground">
                  Are you certain you want to permanently delete this expense? This action will impact your financial calculations and cannot be reversed.
                </p>
              </div>
            </div>
            <div className="p-6 border-t border-border/40 bg-muted/10 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTimeout(() => setExpenseToDelete(null), 200);
                }}
                className="h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-widest"
                disabled={deleteMutation.isPending}
              >
                Abort
              </Button>
              <Button
                variant="destructive"
                onClick={executeDelete}
                disabled={deleteMutation.isPending}
                className="h-11 px-8 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg"
              >
                {deleteMutation.isPending ? "Executing..." : "Execute Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}