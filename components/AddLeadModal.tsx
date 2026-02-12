'use client'

import { useState, FormEvent } from 'react'
import { Lead } from '@/types/lead'

interface AddLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (lead: Omit<Lead, 'id' | 'dateAdded'>) => void
}

export default function AddLeadModal({ isOpen, onClose, onSubmit }: AddLeadModalProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    phoneNumber: '',
    emailAddress: '',
    hasWebsite: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required'
    }

    if (!formData.emailAddress.trim()) {
      newErrors.emailAddress = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
      setFormData({
        companyName: '',
        phoneNumber: '',
        emailAddress: '',
        hasWebsite: false,
      })
      setErrors({})
    }
  }

  const handleClose = () => {
    setFormData({
      companyName: '',
      phoneNumber: '',
      emailAddress: '',
      hasWebsite: false,
    })
    setErrors({})
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-xl border border-slate-200 w-full max-w-md shadow-xl">
        <div className="px-6 pt-6 pb-5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              Add New Lead
            </h2>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100 focus-ring"
              aria-label="Close modal"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-5">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Company Name <span className="text-slate-400">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData({ ...formData, companyName: e.target.value })
                }
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg transition-colors placeholder:text-slate-400 ${errors.companyName
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus-ring`}
                placeholder="Enter company name"
              />
              {errors.companyName && (
                <p className="mt-1.5 text-sm text-red-600">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Phone Number <span className="text-slate-400">*</span>
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg transition-colors placeholder:text-slate-400 ${errors.phoneNumber
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus-ring`}
                placeholder="Enter phone number"
              />
              {errors.phoneNumber && (
                <p className="mt-1.5 text-sm text-red-600">{errors.phoneNumber}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="emailAddress"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email Address <span className="text-slate-400">*</span>
              </label>
              <input
                type="email"
                id="emailAddress"
                value={formData.emailAddress}
                onChange={(e) =>
                  setFormData({ ...formData, emailAddress: e.target.value })
                }
                className={`w-full px-3.5 py-2.5 text-sm border rounded-lg transition-colors placeholder:text-slate-400 ${errors.emailAddress
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                  } focus-ring`}
                placeholder="Enter email address"
              />
              {errors.emailAddress && (
                <p className="mt-1.5 text-sm text-red-600">{errors.emailAddress}</p>
              )}
            </div>

            <div className="pt-1">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.hasWebsite}
                  onChange={(e) =>
                    setFormData({ ...formData, hasWebsite: e.target.checked })
                  }
                  className="w-4 h-4 text-slate-900 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                  Has Website
                </span>
              </label>
            </div>
          </div>

          <div className="px-6 py-5 border-t border-slate-200 bg-slate-50/50 flex justify-end space-x-3 rounded-b-xl">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:bg-white transition-colors focus-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-slate-900 transition-colors focus-ring"
            >
              Add Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

