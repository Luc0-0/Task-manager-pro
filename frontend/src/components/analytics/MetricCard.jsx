import React from 'react';

const MetricCard = ({ title, value, icon, highlightColor = 'text-blue-500' }) => (
  <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg transition duration-300 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center space-x-3 mb-2">
      <span className={`text-2xl ${highlightColor}`}>{icon}</span>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {title}
      </h3>
    </div>
    <p className={`text-4xl font-extrabold text-gray-900 dark:text-white ${highlightColor}`}>
      {value}
    </p>
  </div>
);

export default MetricCard;