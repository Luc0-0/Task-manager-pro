import React from 'react';

const colorMap = {
    'success': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-700 dark:text-green-300', icon: '✅' },
    'warning': { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-700 dark:text-yellow-300', icon: '💡' },
    'error': { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-700 dark:text-red-300', icon: '🚨' },
    'info': { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-700 dark:text-blue-300', icon: '⭐' },
};

const InsightCard = ({ insight }) => {
    const { bg, text, icon } = colorMap[insight.type] || colorMap.info;

    return (
        <div className={`p-4 rounded-xl shadow-md ${bg}`}>
            <div className="flex items-start">
                <span className="text-xl mr-3">{icon}</span>
                <div className="flex-1">
                    <h3 className={`font-bold ${text} text-sm`}>
                        {insight.title}
                    </h3>
                    <p className={`mt-1 text-xs ${text}`}>
                        {insight.message}
                    </p>
                    <p className={`mt-1 text-xs font-medium ${text} opacity-75`}>
                        Suggestion: {insight.suggestion}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default InsightCard;