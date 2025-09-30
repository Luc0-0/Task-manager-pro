import React from 'react';
import ChartCard from './ChartCard';
import MetricCard from './MetricCard';
import InsightCard from './InsightCard';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title } from 'chart.js';

// Register Chart.js components once (SDLC: Efficiency)
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title);

const AnalyticsDashboard = ({ data, period }) => {
  const { kpis, statusData, priorityData, trendData, insights } = data;

  // --- Data structures for Chart.js (SDLC: Clarity) ---
  const pieChartData = {
    labels: statusData.map(d => d.status),
    datasets: [{
      data: statusData.map(d => d.count),
      backgroundColor: statusData.map(d => d.color),
      borderColor: 'transparent',
    }],
  };
  
  const barChartData = {
    labels: priorityData.map(d => d.label),
    datasets: [{
      label: 'Tasks Count',
      data: priorityData.map(d => d.count),
      backgroundColor: priorityData.map(d => d.color),
      borderColor: 'transparent',
    }],
  };
  
  const lineChartData = {
    labels: trendData.map(t => t.date),
    datasets: [{
      label: 'Tasks Completed',
      data: trendData.map(t => t.completed),
      borderColor: '#3b82f6', // Blue-500
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      tension: 0.4,
      pointRadius: 4,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        title: {
            display: true,
            text: 'Daily Completion Trend',
            color: 'rgb(209, 213, 219)', // light gray for dark mode readability
        }
    },
    scales: {
        x: { grid: { display: false } },
        y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  return (
    <div className="space-y-8">

      {/* 1. Productivity Insights (Top Row) */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {insights.map((insight, index) => (
                <InsightCard key={index} insight={insight} />
            ))}
        </div>
      )}
      
      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Tasks" value={kpis.total} icon="📝" />
        <MetricCard title="Completed Tasks" value={kpis.completed} icon="✅" />
        <MetricCard title="Completion Rate" value={`${kpis.completionRate}%`} icon="📈" highlightColor="text-emerald-500" />
        <MetricCard title="Overdue Tasks" value={kpis.total - kpis.completed - kpis.inProgress - kpis.todo - kpis.cancelled} icon="⚠️" highlightColor="text-red-500" />
      </div>

      {/* 3. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Daily Trend (Line Chart) */}
        <ChartCard title={`Completion Trend (${period === 0 ? 'All Time' : `${period} Days`})`} className="lg:col-span-2">
          <Line data={lineChartData} options={lineOptions} />
        </ChartCard>

        {/* Chart 2: Status Breakdown (Pie Chart) */}
        <ChartCard title="Task Status Breakdown">
          <div className="h-full flex justify-center items-center p-4">
            <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </ChartCard>
        
        {/* Chart 3: Priority Breakdown (Bar Chart) */}
        <ChartCard title="Task Priority Distribution" className="lg:col-span-2">
           <Bar data={barChartData} options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              scales: { y: { beginAtZero: true } }
            }} />
        </ChartCard>

        {/* Project Statistics (Table or detailed list could go here) */}
        <ChartCard title="Project Stats" className="lg:col-span-1">
            <p className="text-gray-500 dark:text-gray-400">
                Detailed Project analytics (e.g., project completion rates) are available in the backend response but are best presented in a sortable table component, which can be added here.
            </p>
            <p className="mt-4 text-sm font-semibold text-blue-500">
                Total Projects in Period: {analytics.projectStats ? analytics.projectStats.length : '...'}
            </p>
        </ChartCard>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;