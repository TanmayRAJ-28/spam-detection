'use client'

import { useState } from 'react'

export default function SpamTester() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    naive_bayes: string
    logistic_regression: string
    svm: string
    confidence: {
      naive_bayes: number
      logistic_regression: number
      svm: number
    }
  } | null>(null)

  const analyzeMessage = async () => {
    if (!message.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/predict`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        }
      )

      if (!response.ok) {
        throw new Error('Server error')
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('API Error:', error)
      alert('Backend not connected. Make sure FastAPI is running.')
    }

    setLoading(false)
  }

  const models = [
    { key: 'naive_bayes' as const, label: 'Naive Bayes' },
    { key: 'logistic_regression' as const, label: 'Logistic Regression' },
    { key: 'svm' as const, label: 'SVM' },
  ]

  return (
    <div className="space-y-5">
      <div className="bg-white border border-stone-200 rounded-lg p-5">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste an SMS message here to classify it..."
          className="w-full h-24 px-0 py-0 bg-transparent border-0 text-stone-800 placeholder-stone-400 focus:outline-none resize-none text-[15px]"
        />
        <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100">
          <button
            onClick={analyzeMessage}
            disabled={!message.trim() || loading}
            className="px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-md hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Classifying...' : 'Classify'}
          </button>
          {message && (
            <button
              onClick={() => { setMessage(''); setResult(null) }}
              className="px-4 py-2 text-stone-500 text-sm hover:text-stone-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {models.map(({ key, label }) => {
            const isSpam = result[key].toLowerCase() === 'spam'
            return (
              <div
                key={key}
                className={`rounded-lg border p-4 ${
                  isSpam
                    ? 'bg-red-50 border-red-200'
                    : 'bg-emerald-50 border-emerald-200'
                }`}
              >
                <p className="text-xs text-stone-500 mb-1">{label}</p>
                <p className={`text-lg font-semibold ${
                  isSpam ? 'text-red-700' : 'text-emerald-700'
                }`}>
                  {isSpam ? 'Spam' : 'Not Spam'}
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  {result.confidence[key]}% confidence
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}