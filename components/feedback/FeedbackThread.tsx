'use client'

import { useState, useEffect } from 'react'
import FeedbackForm from './FeedbackForm'

interface Feedback {
    id: string
    leadId: string
    authorId: string
    authorName: string
    authorRole: 'admin' | 'agent'
    message: string
    parentId: string | null
    createdAt: string
    updatedAt: string
}

interface FeedbackThreadProps {
    leadId: string
    userRole: 'admin' | 'agent'
}

export default function FeedbackThread({ leadId, userRole }: FeedbackThreadProps) {
    const [feedback, setFeedback] = useState<Feedback[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [replyingTo, setReplyingTo] = useState<string | null>(null)

    useEffect(() => {
        fetchFeedback()
    }, [leadId])

    const fetchFeedback = async () => {
        try {
            const response = await fetch(`/api/leads/feedback?leadId=${leadId}`)
            if (response.ok) {
                const data = await response.json()
                setFeedback(data)
            }
        } catch (error) {
            console.error('Error fetching feedback:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmitFeedback = async (message: string, parentId?: string) => {
        try {
            const response = await fetch('/api/leads/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    leadId,
                    message,
                    parentId: parentId || null,
                }),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Failed to submit feedback')
            }

            await fetchFeedback()
            setReplyingTo(null)
        } catch (error: any) {
            throw error
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return 'Just now'
        if (diffMins < 60) return `${diffMins}m ago`
        if (diffHours < 24) return `${diffHours}h ago`
        if (diffDays < 7) return `${diffDays}d ago`

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        })
    }

    // Organize feedback into threads (parent messages with replies)
    const organizeFeedback = (allFeedback: Feedback[]) => {
        const parents = allFeedback.filter(f => !f.parentId)
        const replies = allFeedback.filter(f => f.parentId)

        return parents.map(parent => ({
            ...parent,
            replies: replies.filter(r => r.parentId === parent.id),
        }))
    }

    const threads = organizeFeedback(feedback)

    if (isLoading) {
        return (
            <div className="bg-white border border-slate-200 rounded-lg p-6">
                <p className="text-sm text-slate-500">Loading feedback...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* New Feedback Form */}
            <div className="bg-white border border-slate-200 rounded-lg p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    {userRole === 'agent' ? 'Send Feedback to Admin' : 'Add Note'}
                </h3>
                <FeedbackForm
                    leadId={leadId}
                    onSubmit={handleSubmitFeedback}
                    placeholder={
                        userRole === 'agent'
                            ? 'Describe what you did on this lead, any updates, or questions for admin...'
                            : 'Add a note or respond to agent feedback...'
                    }
                    submitLabel={userRole === 'agent' ? 'Send to Admin' : 'Add Note'}
                />
            </div>

            {/* Feedback Threads */}
            {threads.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
                    <p className="text-sm text-slate-500">No feedback yet. Start the conversation!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {threads.map((thread) => (
                        <div key={thread.id} className="bg-white border border-slate-200 rounded-lg p-6">
                            {/* Parent Message */}
                            <div className="mb-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-slate-900">{thread.authorName}</span>
                                        <span
                                            className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${thread.authorRole === 'admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}
                                        >
                                            {thread.authorRole === 'admin' ? 'Admin' : 'Agent'}
                                        </span>
                                        <span className="text-xs text-slate-500">{formatDate(thread.createdAt)}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{thread.message}</p>
                            </div>

                            {/* Replies */}
                            {thread.replies.length > 0 && (
                                <div className="ml-6 pl-6 border-l-2 border-slate-200 space-y-4">
                                    {thread.replies.map((reply) => (
                                        <div key={reply.id}>
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm font-medium text-slate-900">{reply.authorName}</span>
                                                    <span
                                                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${reply.authorRole === 'admin'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                            }`}
                                                    >
                                                        {reply.authorRole === 'admin' ? 'Admin' : 'Agent'}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{formatDate(reply.createdAt)}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{reply.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Reply Button */}
                            {replyingTo !== thread.id && (
                                <div className="mt-4">
                                    <button
                                        onClick={() => setReplyingTo(thread.id)}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Reply
                                    </button>
                                </div>
                            )}

                            {/* Reply Form */}
                            {replyingTo === thread.id && (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <FeedbackForm
                                        leadId={leadId}
                                        parentId={thread.id}
                                        onSubmit={(message) => handleSubmitFeedback(message, thread.id)}
                                        onCancel={() => setReplyingTo(null)}
                                        placeholder="Write your response..."
                                        submitLabel="Send Reply"
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

