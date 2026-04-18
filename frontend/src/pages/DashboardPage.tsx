"use client"

import * as React from "react"
import { fetchOrders, fetchExpenses } from "@/services/api"
import { formatPHP } from "@/utils/currency"
import { 
  TrendingUp, 
  Wallet, 
  Activity,
  ArrowRight,
  Download,
  TerminalSquare,
  PackageCheck
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Label
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

// --- STRICT YELLOW COLOR MAPPING (From index.css) ---
const areaChartConfig = {
  revenue: { label: "Gross Revenue", color: "var(--primary)" },
  expenses: { label: "Operating Expenses", color: "var(--secondary)" },
} satisfies ChartConfig

const barChartConfig = {
  orders: { label: "Total Orders", color: "var(--primary)" },
} satisfies ChartConfig

const pieChartConfig = {
  volume: { label: "Units Sold" },
  item1: { label: "Top 1", color: "var(--primary)" },
  item2: { label: "Top 2", color: "var(--secondary)" },
  item3: { label: "Top 3", color: "var(--chart-3)" },
  item4: { label: "Top 4", color: "var(--chart-4)" },
  other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true)
  const [timeRange, setTimeRange] = React.useState(7)
  
  const [rawData, setRawData] = React.useState({
    orders: [] as any[],
    expenses: [] as any[]
  })

  // 1. Fetch Real Data
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [fetchedOrders, fetchedExpenses] = await Promise.all([
          fetchOrders(),
          fetchExpenses()
        ])
        setRawData({
          orders: fetchedOrders || [],
          expenses: fetchedExpenses || []
        })
      } catch (err) {
        console.error("Dashboard Data Sync Failed:", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 2. Compute Dashboard Metrics & Charts
  const { kpis, cashFlowData, dailyTraffic, topPerformers } = React.useMemo(() => {
    const now = new Date()
    const cutoff = new Date()
    cutoff.setDate(now.getDate() - timeRange)

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()

    const validOrders = rawData.orders.filter(o => new Date(o.targetDate || o.createdAt) >= cutoff)
    const validExpenses = rawData.expenses.filter(e => new Date(e.date) >= cutoff)
    const fulfilledOrders = validOrders.filter(o => o.status === 'FULFILLED')

    // --- KPIs ---
    const todaysOrders = fulfilledOrders.filter(o => new Date(o.targetDate || o.createdAt).getTime() >= todayStart)
    const activeOrders = rawData.orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING')
    
    const todaysRevenue = todaysOrders.reduce((acc, o) => acc + (o.amountPaid || o.totalAmount || 0), 0)
    const totalRevenuePeriod = fulfilledOrders.reduce((acc, o) => acc + (o.amountPaid || o.totalAmount || 0), 0)
    const avgTicket = fulfilledOrders.length ? (totalRevenuePeriod / fulfilledOrders.length) : 0

    // --- AREA CHART (Cash Flow) & BAR CHART (Daily Orders) ---
    const dailyMap = new Map<string, { date: string, revenue: number, expenses: number, orders: number }>()
    
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      dailyMap.set(dateStr, { date: dateStr, revenue: 0, expenses: 0, orders: 0 })
    }

    fulfilledOrders.forEach(o => {
      const dStr = new Date(o.targetDate || o.createdAt).toISOString().split('T')[0]
      if (dailyMap.has(dStr)) {
        const day = dailyMap.get(dStr)!
        day.revenue += (o.amountPaid || o.totalAmount || 0)
        day.orders += 1
      }
    })

    validExpenses.forEach(e => {
      const dStr = new Date(e.date).toISOString().split('T')[0]
      if (dailyMap.has(dStr)) {
        dailyMap.get(dStr)!.expenses += (e.amount || 0)
      }
    })

    // --- PIE CHART (Top Performers) ---
    const productCount: Record<string, number> = {}
    fulfilledOrders.forEach(o => {
      o.items?.forEach((item: any) => {
        const name = item.product?.name || "Unknown"
        productCount[name] = (productCount[name] || 0) + (item.quantity || 1)
      })
    })

    const sortedProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1])
    const top4 = sortedProducts.slice(0, 4)
    const others = sortedProducts.slice(4).reduce((acc, curr) => acc + curr[1], 0)
    
    const palette = ["var(--primary)", "var(--secondary)", "var(--chart-3)", "var(--chart-4)"]
    const pieData = top4.map((p, i) => ({
      name: p[0],
      volume: p[1],
      fill: palette[i]
    }))

    if (others > 0) {
      pieData.push({ name: "Other", volume: others, fill: "var(--chart-5)" })
    }

    return {
      kpis: { todaysRevenue, activeOrders: activeOrders.length, avgTicket, totalVolume: fulfilledOrders.length },
      cashFlowData: Array.from(dailyMap.values()),
      dailyTraffic: Array.from(dailyMap.values()).map(d => ({ date: d.date, orders: d.orders })),
      topPerformers: pieData
    }
  }, [rawData, timeRange])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen">
        <span className="text-sm font-black tracking-widest uppercase animate-pulse text-primary">Synchronizing Ledger...</span>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-4 min-h-screen animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-0">
        <div className="space-y-1">
          <h1 
            className="text-5xl sm:text-6xl font-black text-foreground tracking-tighter leading-none" 
            style={{ fontFamily: '"Instrument Serif", serif' }}
          >
            Dashboard
          </h1>
          <p className="text-muted-foreground font-semibold flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live business intelligence and operations overview.
          </p>
        </div>

        <div className="flex gap-3 items-center">
          <Button 
            variant="outline" 
            className="h-10 px-5 rounded-lg font-black text-[10px] uppercase tracking-widest border-border text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Report
          </Button>
          <Button 
            className="h-10 pl-5 pr-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-black text-[10px] uppercase tracking-widest shadow-sm transition-all flex items-center gap-2"
          >
            Launch POS <TerminalSquare className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: formatPHP(kpis.todaysRevenue), icon: TrendingUp, isPrimary: true },
          { label: "Active Orders", value: kpis.activeOrders.toString().padStart(2, "0"), icon: Activity, isPrimary: false },
          { label: "Avg. Ticket", value: formatPHP(kpis.avgTicket), icon: Wallet, isPrimary: false },
          { label: "Period Volume", value: kpis.totalVolume.toString().padStart(2, "0"), icon: PackageCheck, isPrimary: false },
        ].map((kpi, idx) => (
          <div key={idx} className="flex flex-col p-6 rounded-xl border border-border bg-card relative overflow-hidden shadow-sm">
            <kpi.icon className={`absolute -right-6 -bottom-6 w-32 h-32 opacity-[0.03] ${kpi.isPrimary ? 'text-primary' : 'text-foreground'}`} aria-hidden="true" />
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] relative z-10 flex justify-between">
              {kpi.label}
            </span>
            <span className={`mt-2 text-3xl font-black tracking-tighter relative z-10 truncate ${kpi.isPrimary ? 'text-primary' : 'text-foreground'}`}>
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Cash Flow Dynamics (Area Chart) */}
        <Card className="xl:col-span-2 shadow-sm rounded-xl flex flex-col border-border/60">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row bg-muted/10 rounded-t-xl">
            <div className="grid flex-1 gap-0.5">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Cash Flow Dynamics</CardTitle>
              <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Revenue vs Expenses tracking over period.
              </CardDescription>
            </div>
            
            {/* Segmented Tab Filter */}
            <div className="flex bg-background p-1 rounded-lg border shadow-sm">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days)}
                  className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${
                    timeRange === days 
                      ? "bg-foreground text-background shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 flex-1">
            <ChartContainer config={areaChartConfig} className="aspect-auto h-[260px] w-full">
              <AreaChart data={cashFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="fillExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  minTickGap={32}
                  className="text-[10px] font-black uppercase fill-muted-foreground"
                  tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  className="text-[10px] font-black uppercase fill-muted-foreground"
                  tickFormatter={(val) => `₱${val/1000}k`}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      indicator="dot"
                    />
                  }
                />
                <Area dataKey="expenses" type="monotone" fill="url(#fillExp)" stroke="var(--secondary)" strokeWidth={2} stackId="b" />
                <Area dataKey="revenue" type="monotone" fill="url(#fillRev)" stroke="var(--primary)" strokeWidth={2} stackId="a" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Performers (Pie Chart) */}
        <Card className="flex flex-col shadow-sm rounded-xl border-border/60">
          <CardHeader className="items-center pb-2 pt-4 border-b bg-muted/10 rounded-t-xl mb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Top Performers</CardTitle>
            <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest pb-1">Volume distribution by item</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0 pt-2">
            {topPerformers.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No Sales Data</span>
              </div>
            ) : (
              <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[240px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={topPerformers}
                    dataKey="volume"
                    nameKey="name"
                    innerRadius={65}
                    outerRadius={90}
                    strokeWidth={4}
                    stroke="hsl(var(--background))"
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-4xl font-black">
                                {kpis.totalVolume}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-[9px] font-black uppercase tracking-widest">
                                Total Units
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Daily Volume (Bar Chart) */}
      <Card className="shadow-sm rounded-xl flex flex-col border-border/60">
        <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row bg-muted/10 rounded-t-xl">
          <div className="flex flex-1 flex-col justify-center gap-0.5 px-6 pt-4 pb-3 sm:py-4">
            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Fulfillment Velocity</CardTitle>
            <CardDescription className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Total orders processed per day over the selected timeframe.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:p-6">
          <ChartContainer config={barChartConfig} className="aspect-auto h-[200px] w-full">
            <BarChart accessibilityLayer data={dailyTraffic} margin={{ top: 10, left: -20, right: 12 }}>
              <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" opacity={0.5} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-[10px] font-black uppercase fill-muted-foreground"
                tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                className="text-[10px] font-black uppercase fill-muted-foreground"
              />
              <ChartTooltip
                cursor={{ fill: 'currentColor', opacity: 0.05 }}
                content={
                  <ChartTooltipContent 
                    className="w-[140px]" 
                    labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  />
                }
              />
              <Bar dataKey="orders" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}