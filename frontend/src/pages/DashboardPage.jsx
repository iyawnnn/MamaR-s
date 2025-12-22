import React from 'react';
import { ArrowUpRight, DollarSign, Package } from "lucide-react";

// Simple Reusable Stats Card
const StatsCard = ({ title, value, trend, trendUp, icon: Icon, alert = false }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-stone-500">{title}</p>
        <h3 className="text-2xl font-bold text-stone-800 mt-2">{value}</h3>
        <div className={`flex items-center mt-2 text-sm ${alert ? 'text-red-600 font-medium' : (trendUp ? 'text-green-600' : 'text-stone-400')}`}>
          {trendUp ? <ArrowUpRight className="w-4 h-4 mr-1" /> : null} 
          {trend}
        </div>
      </div>
      <div className={`p-3 rounded-lg ${alert ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-stone-800">Dashboard</h2>
        <p className="text-stone-500 mt-1">Here is what's happening in your bakery today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value="$12,450" 
          trend="+12%" 
          trendUp={true} 
          icon={DollarSign} 
        />
        <StatsCard 
          title="Low Stock Items" 
          value="4" 
          trend="Urgent" 
          trendUp={false} 
          icon={Package} 
          alert={true}
        />
        {/* Add more cards here as needed */}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-stone-100">
          <h3 className="font-semibold text-stone-800">Recent Orders</h3>
        </div>
        <div className="p-6">
           <div className="text-sm text-stone-500 text-center py-8">
             No recent orders found.
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;