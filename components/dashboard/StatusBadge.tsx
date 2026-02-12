interface StatusBadgeProps {
    status: 'new' | 'contacted' | 'interested' | 'non-interested' | 'closed'
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const getStatusStyles = () => {
        switch (status) {
            case 'new':
                return 'bg-slate-100 text-slate-700'
            case 'contacted':
                return 'bg-blue-50 text-blue-700'
            case 'interested':
                return 'bg-green-50 text-green-700'
            case 'non-interested':
                return 'bg-amber-50 text-amber-700'
            case 'closed':
                return 'bg-slate-200 text-slate-600'
            default:
                return 'bg-slate-100 text-slate-700'
        }
    }

    const formatStatus = (status: string) => {
        return status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    }

    return (
        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md ${getStatusStyles()}`}>
            {formatStatus(status)}
        </span>
    )
}

