'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MetricsData {
  models: {
    [key: string]: {
      accuracy: number
      precision: number
      recall: number
      f1: number
      confusion_matrix: number[][]
    }
  }
}

export default function ModelComparison() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const response = await fetch('/data/metrics.json')
        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error('Failed to load metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [])

  if (loading) {
    return (
      <div className="py-12 text-stone-400 text-sm">Loading metrics...</div>
    )
  }

  if (!metrics) {
    return (
      <div className="py-12 text-red-500 text-sm">Failed to load metrics.</div>
    )
  }

  const chartData = [
    {
      name: 'Naive Bayes',
      accuracy: +(metrics.models.naive_bayes.accuracy * 100).toFixed(2),
      precision: +(metrics.models.naive_bayes.precision * 100).toFixed(2),
      recall: +(metrics.models.naive_bayes.recall * 100).toFixed(2),
      f1: +(metrics.models.naive_bayes.f1 * 100).toFixed(2),
    },
    {
      name: 'Log. Regression',
      accuracy: +(metrics.models.logistic_regression.accuracy * 100).toFixed(2),
      precision: +(metrics.models.logistic_regression.precision * 100).toFixed(2),
      recall: +(metrics.models.logistic_regression.recall * 100).toFixed(2),
      f1: +(metrics.models.logistic_regression.f1 * 100).toFixed(2),
    },
    {
      name: 'SVM',
      accuracy: +(metrics.models.svm.accuracy * 100).toFixed(2),
      precision: +(metrics.models.svm.precision * 100).toFixed(2),
      recall: +(metrics.models.svm.recall * 100).toFixed(2),
      f1: +(metrics.models.svm.f1 * 100).toFixed(2),
    },
  ]

  const modelRows = [
    { key: 'naive_bayes', label: 'Naive Bayes', data: metrics.models.naive_bayes },
    { key: 'logistic_regression', label: 'Logistic Regression', data: metrics.models.logistic_regression },
    { key: 'svm', label: 'SVM', data: metrics.models.svm },
  ]

  const bestAccuracy = Math.max(...modelRows.map(m => m.data.accuracy))

  return (
    <div className="space-y-8">
      {/* Metrics Table */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50">
              <th className="text-left px-5 py-3 font-medium text-stone-500">Model</th>
              <th className="text-right px-5 py-3 font-medium text-stone-500">Accuracy</th>
              <th className="text-right px-5 py-3 font-medium text-stone-500 hidden sm:table-cell">Precision</th>
              <th className="text-right px-5 py-3 font-medium text-stone-500 hidden sm:table-cell">Recall</th>
              <th className="text-right px-5 py-3 font-medium text-stone-500">F1</th>
            </tr>
          </thead>
          <tbody>
            {modelRows.map((model, idx) => (
              <tr key={model.key} className={idx < modelRows.length - 1 ? 'border-b border-stone-100' : ''}>
                <td className="px-5 py-3.5 font-medium text-stone-800">
                  {model.label}
                  {model.data.accuracy === bestAccuracy && (
                    <span className="ml-2 text-[10px] bg-stone-800 text-white px-1.5 py-0.5 rounded font-medium uppercase tracking-wide">
                      best
                    </span>
                  )}
                </td>
                <td className="text-right px-5 py-3.5 tabular-nums font-semibold text-stone-900">
                  {(model.data.accuracy * 100).toFixed(1)}%
                </td>
                <td className="text-right px-5 py-3.5 tabular-nums text-stone-600 hidden sm:table-cell">
                  {(model.data.precision * 100).toFixed(1)}%
                </td>
                <td className="text-right px-5 py-3.5 tabular-nums text-stone-600 hidden sm:table-cell">
                  {(model.data.recall * 100).toFixed(1)}%
                </td>
                <td className="text-right px-5 py-3.5 tabular-nums text-stone-600">
                  {(model.data.f1 * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confusion Matrices */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {modelRows.map((model) => {
          const cm = model.data.confusion_matrix
          return (
            <div key={model.key} className="bg-white border border-stone-200 rounded-lg p-4">
              <p className="text-xs font-medium text-stone-500 mb-3">{model.label} — Confusion Matrix</p>
              <div className="grid grid-cols-2 gap-1.5 text-center text-xs">
                <div className="bg-stone-100 rounded py-2">
                  <span className="text-stone-400 block text-[10px]">TN</span>
                  <span className="font-semibold text-stone-700">{cm[0][0]}</span>
                </div>
                <div className="bg-red-50 rounded py-2">
                  <span className="text-stone-400 block text-[10px]">FP</span>
                  <span className="font-semibold text-red-600">{cm[0][1]}</span>
                </div>
                <div className="bg-red-50 rounded py-2">
                  <span className="text-stone-400 block text-[10px]">FN</span>
                  <span className="font-semibold text-red-600">{cm[1][0]}</span>
                </div>
                <div className="bg-emerald-50 rounded py-2">
                  <span className="text-stone-400 block text-[10px]">TP</span>
                  <span className="font-semibold text-emerald-600">{cm[1][1]}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Chart */}
      <div className="bg-white border border-stone-200 rounded-lg p-5">
        <p className="text-xs font-medium text-stone-500 mb-4">Side-by-side comparison (%)</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
            <XAxis dataKey="name" stroke="#a8a29e" tick={{ fontSize: 12 }} />
            <YAxis stroke="#a8a29e" tick={{ fontSize: 12 }} domain={[80, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #d6d3d1',
                borderRadius: '6px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="accuracy" fill="#292524" radius={[3, 3, 0, 0]} name="Accuracy" />
            <Bar dataKey="precision" fill="#78716c" radius={[3, 3, 0, 0]} name="Precision" />
            <Bar dataKey="recall" fill="#a8a29e" radius={[3, 3, 0, 0]} name="Recall" />
            <Bar dataKey="f1" fill="#d6d3d1" radius={[3, 3, 0, 0]} name="F1" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3 justify-center text-xs text-stone-500">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-stone-800 inline-block" /> Accuracy</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-stone-500 inline-block" /> Precision</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-stone-400 inline-block" /> Recall</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-stone-300 inline-block" /> F1</span>
        </div>
      </div>
    </div>
  )
}
