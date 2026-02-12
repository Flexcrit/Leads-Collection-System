'use client'

import { useState, FormEvent } from 'react'

interface FeedbackFormProps {
    leadId: string
    parentId?: string
    onSubmit: (message: string) => Promise<void>
    onCancel?: () => void
    placeholder?: string
    submitLabel?: string
}

export default function FeedbackForm({
    leadId,
    parentId,
    onSubmit,
    onCancel,
    placeholder = 'Write your feedback or response...',
    submitLabel = 'Send Feedback',
}: FeedbackFormProps) {
    const [message, setMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        if (!message.trim()) {
            setError('Please enter a message')
            return
        }

        setIsSubmitting(true)
        try {
            await onSubmit(message)
            setMessage('')
        } catch (err: any) {
            setError(err.message || 'Failed to submit feedback')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={placeholder}
                    rows={4}
                    className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                    disabled={isSubmitting}
                />
                {error && (
                    <p className="mt-1 text-sm text-red-600">{error}</p>
                )}
            </div>
            <div className="flex items-center justify-end space-x-3">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSubmitting ? 'Sending...' : submitLabel}
                </button>
            </div>
        </form>
    )
}

