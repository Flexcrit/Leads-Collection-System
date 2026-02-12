import { Metric } from '@/types/lead'

interface MetricCardProps {
    metric: Metric
}

export default function MetricCard({ metric }: MetricCardProps) {
    const getTrendColor = () => {
        if (metric.trend === 'up') return 'text-green-600'
        if (metric.trend === 'down') return 'text-red-600'
        return 'text-slate-500'
    }

    const getTrendIcon = () => {
        if (metric.trend === 'up') {
            return (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            )
        }
        if (metric.trend === 'down') {
            return (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
            )
        }
        return null
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-5">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600 mb-1">{metric.label}</p>
                    <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
                    {metric.secondary && (
                        <p className="text-xs text-slate-500 mt-1.5">{metric.secondary}</p>
                    )}
                </div>
                {metric.trend && (
                    <div className={`flex items-center space-x-0.5 ${getTrendColor()}`}>
                        {getTrendIcon()}
                    </div>
                )}
            </div>
        </div>
    )
}

