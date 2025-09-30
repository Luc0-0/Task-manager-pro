import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAnalytics } from '../store/analyticsSlice'; // <--- We will assume you create this Redux action
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

// Define Period options for the UI
const PERIOD_OPTIONS = [
  { value: 30, label: 'Last 30 Days' },
  { value: 90, label: 'Last 90 Days' },
  { value: 0, label: 'All Time' }, // Assuming 0 or a very large number means "All Time" on the backend
];

const Analytics = () => {
  const dispatch = useDispatch();
  // Assume a new slice is created to hold the analytics data
  const { analytics, isLoading } = useSelector((state) => state.analytics);
  const { user } = useSelector((state) => state.auth);
  
  // State for the active time period filter
  const [activePeriod, setActivePeriod] = useState(PERIOD_OPTIONS[0].value);
  
  // 1. SDLC: Data Fetching and Dependencies
  useEffect(() => {
    if (user) {
      // Dispatch action to fetch analytics for the active period
      // This will call your backend's AnalyticsService.getUserAnalytics(user._id, activePeriod)
      dispatch(getAnalytics(activePeriod));
    }
  }, [dispatch, user, activePeriod]); 

  // 2. SDLC: Data Preparation & Chart Options
  // Memos are used here to prevent unnecessary recalculations on re-render.
  const chartData = useMemo(() => {
    if (!analytics) return null;

    // --- Status Breakdown (Pie/Doughnut Chart) ---
    const statusData = [
        { status: 'Completed', count: analytics.taskStats.completed, color: '#10b981' }, // Emerald-500
        { status: 'In Progress', count: analytics.taskStats.inProgress, color: '#3b82f6' }, // Blue-500
        { status: 'To Do', count: analytics.taskStats.todo, color: '#f59e0b' }, // Amber-500
        { status: 'Cancelled', count: analytics.taskStats.cancelled, color: '#ef4444' }, // Red-500
    ].filter(d => d.count > 0);

    // --- Priority Breakdown (Bar Chart) ---
    // Match Priority values: low, medium, high, urgent
    const priorityMapping = {
        'low': { label: 'Low', color: '#60a5fa' }, // Blue-400
        'medium': { label: 'Medium', color: '#fcd34d' }, // Amber-300
        'high': { label: '#f87171', color: 'High' }, // Red-400
        'urgent': { label: 'Urgent', color: '#dc2626' }, // Red-700
    };

    const priorityData = analytics.priorityDistribution.map(p => ({
        label: priorityMapping[p._id]?.label || p._id,
        count: p.count,
        color: priorityMapping[p._id]?.color || '#9ca3af', // Gray
    }));

    // --- Trend Data (Line Chart) ---
    const trendData = analytics.completionTrend.map(t => ({
        date: t._id,
        completed: t.count,
    }));
    
    return { statusData, priorityData, trendData, kpis: analytics.taskStats, insights: analytics.insights };
  }, [analytics]);


  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // 3. Thematic Consistency: Layout and Controls
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">
          Analytics Dashboard
        </h1>
        
        {/* Period Selector (Matching existing select styles) */}
        <div className="flex items-center space-x-2">
          <label htmlFor="period-select" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            View:
          </label>
          <select
            id="period-select"
            value={activePeriod}
            onChange={(e) => setActivePeriod(parseInt(e.target.value))}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {PERIOD_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        {chartData ? (
          <AnalyticsDashboard data={chartData} period={activePeriod} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            No productivity data found for this period.
          </div>
        )}
      </div>

    </div>
  );
};

export default Analytics;