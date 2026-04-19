"use client"

import * as React from "react"
import { fetchOrders, fetchExpenses } from "@/services/api"
import { formatPHP } from "@/utils/currency"
import { 
  TrendingUp, 
  Wallet, 
  PackageCheck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Percent,
  Server,
  Activity
} from "lucide-react"

import {
  Card,
  CardContent,
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
  Cell,
  Tooltip
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const areaChartConfig = {
  revenue: { label: "Revenue", color: "var(--primary)" },
} satisfies ChartConfig

const barChartConfig = {
  orders: { label: "Orders", color: "var(--primary)" },
} satisfies ChartConfig

const pieChartConfig = {
  volume: { label: "Volume" },
} satisfies ChartConfig

export default function DashboardPage() {
  const [loading, setLoading] = React.useState(true)
  const [timeRange, setTimeRange] = React.useState(7)
  
  const [rawData, setRawData] = React.useState({
    orders: [] as any[],
    expenses: [] as any[]
  })

  React.useEffect(() => {
    const loadLedgerData = async () => {
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
        console.error("Ledger synchronization failed", err)
      } finally {
        setLoading(false)
      }
    }
    loadLedgerData()
  }, [])

  const { kpis, cashFlowData, dailyTraffic, topPerformers, recentOrders, insights } = React.useMemo(() => {
    const now = new Date()
    const currentPeriodStart = new Date()
    currentPeriodStart.setDate(now.getDate() - timeRange)
    
    const previousPeriodStart = new Date()
    previousPeriodStart.setDate(now.getDate() - (timeRange * 2))

    const validOrders = rawData.orders.filter(o => o.status === 'FULFILLED')
    const validExpenses = rawData.expenses
    
    const currentOrders = validOrders.filter(o => new Date(o.targetDate || o.createdAt) >= currentPeriodStart)
    const previousOrders = validOrders.filter(o => {
      const d = new Date(o.targetDate || o.createdAt)
      return d >= previousPeriodStart && d < currentPeriodStart
    })

    const currentExpenses = validExpenses.filter(e => new Date(e.date) >= currentPeriodStart).reduce((acc, e) => acc + (e.amount || 0), 0)
    const currentRevenue = currentOrders.reduce((acc, o) => acc + (o.amountPaid || o.totalAmount || 0), 0)
    const previousRevenue = previousOrders.reduce((acc, o) => acc + (o.amountPaid || o.totalAmount || 0), 0)
    
    const calculateDelta = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const avgTicket = currentOrders.length ? (currentRevenue / currentOrders.length) : 0
    const operatingMargin = currentRevenue > 0 ? ((currentRevenue - currentExpenses) / currentRevenue) * 100 : 0

    const activeOrders = rawData.orders.filter(o => o.status === 'PENDING' || o.status === 'PREPARING')
    const pendingQueueValue = activeOrders.reduce((acc, o) => acc + (o.amountPaid || o.totalAmount || 0), 0)

    const dailyMap = new Map<string, { date: string, revenue: number, expenses: number, orders: number }>()
    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      dailyMap.set(dateStr, { date: dateStr, revenue: 0, expenses: 0, orders: 0 })
    }

    currentOrders.forEach(o => {
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

    const productCount: Record<string, number> = {}
    currentOrders.forEach(o => {
      o.items?.forEach((item: any) => {
        const name = item.product?.name || "Uncategorized"
        productCount[name] = (productCount[name] || 0) + (item.quantity || 1)
      })
    })

    const sortedProducts = Object.entries(productCount).sort((a, b) => b[1] - a[1])
    const top4 = sortedProducts.slice(0, 4)
    const pieData = top4.map((p, i) => ({
      name: p[0],
      volume: p[1],
      opacity: 1 - (i * 0.2) 
    }))

    const sortedRecentOrders = [...rawData.orders].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 4)

    const hourCounts = new Array(24).fill(0)
    currentOrders.forEach(o => {
      const hour = new Date(o.createdAt).getHours()
      hourCounts[hour]++
    })
    const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
    const peakHourStr = peakHour > 0 ? `${peakHour}:00 to ${peakHour + 1}:00` : 'N/A'
    const peakVolume = Math.max(...hourCounts)

    return {
      kpis: { 
        currentRevenue, 
        activeQueueCount: activeOrders.length, 
        pendingQueueValue,
        avgTicket, 
        currentVolume: currentOrders.length, 
        revenueDelta: calculateDelta(currentRevenue, previousRevenue), 
        volumeDelta: calculateDelta(currentOrders.length, previousOrders.length),
        operatingMargin
      },
      cashFlowData: Array.from(dailyMap.values()),
      dailyTraffic: Array.from(dailyMap.values()).map(d => ({ date: d.date, orders: d.orders })),
      topPerformers: pieData,
      recentOrders: sortedRecentOrders,
      insights: { peakHourStr, peakVolume }
    }
  }, [rawData, timeRange])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-1 w-24 bg-primary rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-background/50 animate-pulse" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest font-satoshi">Establishing Connection</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 space-y-6 min-h-screen bg-background font-satoshi animate-in fade-in duration-500">
      
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-border/40">
        <div className="space-y-2">
          <h1 className="text-5xl sm:text-6xl font-black text-primary tracking-tighter leading-none capitalize">
            Dashboard
          </h1>
          <p className="text-muted-foreground font-semibold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Overview of your business intelligence and operations ledger.
          </p>
        </div>

        <div className="flex bg-muted/20 p-1.5 rounded-lg border border-border/40 w-max">
          {[7, 14, 30].map(days => (
            <button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-5 py-2 text-xs uppercase tracking-widest font-bold rounded-md transition-all ${
                timeRange === days 
                  ? "bg-background text-foreground shadow-sm border border-border/50" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {days}D
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { title: "Gross Revenue", value: formatPHP(kpis.currentRevenue), icon: Wallet, delta: kpis.revenueDelta },
          { title: "Fulfillment Volume", value: kpis.currentVolume.toString(), icon: PackageCheck, delta: kpis.volumeDelta },
          { title: "Average Ticket", value: formatPHP(kpis.avgTicket), icon: TrendingUp, delta: null },
          { title: "Operating Margin", value: `${kpis.operatingMargin.toFixed(1)}%`, icon: Percent, delta: null },
        ].map((metric, idx) => (
          <div key={idx} className="p-6 rounded-2xl border border-border/40 bg-gradient-to-br from-card/30 to-card/10 flex flex-col justify-between gap-6 transition-all hover:border-border/60">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{metric.title}</span>
              <metric.icon className="w-4 h-4 text-muted-foreground/40" />
            </div>
            <div>
              <span className="text-3xl font-black tracking-tight text-foreground block">{metric.value}</span>
              <div className="mt-2 h-4 flex items-center">
                {metric.delta !== null ? (
                  <span className={`text-xs font-bold flex items-center ${metric.delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {metric.delta >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                    {Math.abs(metric.delta).toFixed(1)}% <span className="text-muted-foreground/40 ml-1.5 font-medium tracking-normal normal-case">vs prior period</span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/40 font-medium">Period calculation</span> 
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <Card className="border border-border/40 shadow-none rounded-xl bg-card/10">
          <CardHeader className="pb-4 pt-5 px-6">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Revenue Flow</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <ChartContainer config={areaChartConfig} className="h-[200px] w-full">
              <AreaChart data={cashFlowData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillPrimary" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="2 4" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  minTickGap={30}
                  className="text-[10px] font-bold fill-muted-foreground uppercase"
                  tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  width={65}
                  className="text-xs font-bold fill-muted-foreground uppercase"
                  tickFormatter={(val) => `₱${(val/1000).toFixed(0)}k`}
                />
                <ChartTooltip
                  cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={
                    <ChartTooltipContent 
                      indicator="dot"
                      labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} 
                      className="border-border/50 bg-background/95 backdrop-blur shadow-md px-5 py-3 capitalize" 
                    />
                  }
                />
                <Area dataKey="revenue" type="monotone" fill="url(#fillPrimary)" stroke="var(--primary)" strokeWidth={2} activeDot={{ r: 4, fill: "var(--primary)", strokeWidth: 0 }} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border border-border/40 shadow-none rounded-xl bg-card/10">
          <CardHeader className="pb-4 pt-5 px-6">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Fulfillment Cadence</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <ChartContainer config={barChartConfig} className="h-[200px] w-full">
              <BarChart data={dailyTraffic} margin={{ top: 0, left: -24, right: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="2 4" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={12}
                  minTickGap={24}
                  className="text-[10px] font-bold fill-muted-foreground uppercase"
                  tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={12} className="text-xs font-bold fill-muted-foreground uppercase" />
                <ChartTooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.1 }}
                  content={
                    <ChartTooltipContent 
                      indicator="dot"
                      labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })} 
                      className="border-border/50 bg-background/95 backdrop-blur shadow-md px-5 py-3 capitalize" 
                    />
                  }
                />
                <Bar dataKey="orders" fill="var(--primary)" radius={[2, 2, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
        
        <Card className="border border-border/40 shadow-none rounded-xl bg-card/10">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Server className="w-4 h-4" /> System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-4 space-y-8">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-foreground">Active Queue</span>
                <span className="text-2xl font-mono font-black leading-none">{kpis.activeQueueCount}</span>
              </div>
              <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${Math.min((kpis.activeQueueCount / 50) * 100, 100)}%` }} />
              </div>
              <span className="text-xs text-muted-foreground/60 font-medium mt-2 block">Capacity threshold reference</span>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-foreground">Peak Operations</span>
                <span className="text-xl font-mono font-black leading-none">{insights.peakHourStr}</span>
              </div>
              <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-muted-foreground/40" style={{ width: `${Math.min((insights.peakVolume / 20) * 100, 100)}%` }} />
              </div>
              <span className="text-xs text-muted-foreground/60 font-medium mt-2 block">Highest intake frequency</span>
            </div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-foreground">Queue Value</span>
                <span className="text-xl font-mono font-black leading-none">{formatPHP(kpis.pendingQueueValue)}</span>
              </div>
              <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                <div className="h-full bg-primary/60" style={{ width: `${Math.min((kpis.pendingQueueValue / 50000) * 100, 100)}%` }} />
              </div>
              <span className="text-xs text-muted-foreground/60 font-medium mt-2 block">Unrealized revenue pipeline</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 shadow-none rounded-xl bg-card/10 flex flex-col">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Velocity by Item</CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-2 flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-full">
              <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[160px] w-full">
                <PieChart>
                  <Tooltip 
                    cursor={false} 
                    content={
                      <ChartTooltipContent 
                        hideLabel 
                        className="border-border/50 bg-background/95 backdrop-blur px-5 py-3 shadow-md capitalize" 
                      />
                    } 
                  />
                  <Pie data={topPerformers} dataKey="volume" nameKey="name" innerRadius={50} outerRadius={75} strokeWidth={0} paddingAngle={2}>
                    {topPerformers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="var(--primary)" fillOpacity={entry.opacity} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="w-full space-y-3">
              {topPerformers.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" style={{ opacity: item.opacity }} />
                    <span className="text-sm font-semibold text-muted-foreground truncate capitalize">{item.name}</span>
                  </div>
                  <span className="text-sm font-mono font-bold">{item.volume}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/40 shadow-none rounded-xl bg-card/10">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
              <span className="flex items-center gap-2"><Activity className="w-4 h-4" /> Recent Sync</span>
              <Clock className="w-4 h-4 opacity-50" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-2 space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm font-medium text-muted-foreground text-center py-6">Ledger empty</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order._id || order.id} className="flex justify-between items-center py-2.5 border-b border-border/20 last:border-0">
                  <div>
                    <p className="text-sm font-bold text-foreground uppercase tracking-wider">#{String(order._id || order.id).slice(-5)}</p>
                    <p className="text-xs font-medium text-muted-foreground/70 mt-1">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-foreground">{formatPHP(order.amountPaid || order.totalAmount || 0)}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'FULFILLED' ? 'bg-emerald-500' : 'bg-primary'}`} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{order.status}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}