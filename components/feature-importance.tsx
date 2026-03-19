'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FeaturesData {
  feature_importance: {
    [key: string]: string[]
  }
}

export default function FeatureImportance() {
  const [features, setFeatures] = useState<FeaturesData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFeatures = async () => {
      try {
        const response = await fetch('/data/metrics.json')
        const data = await response.json()
        setFeatures(data)
      } catch (error) {
        console.error('Failed to load features:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFeatures()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-400">Loading features...</div>
      </div>
    )
  }

  if (!features) {
    return (
      <div className="text-red-400 py-12">
        Error loading feature data
      </div>
    )
  }

  const models = [
    {
      name: 'Naive Bayes',
      key: 'naive_bayes',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
    },
    {
      name: 'Logistic Regression',
      key: 'logistic_regression',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
    },
    {
      name: 'SVM',
      key: 'svm',
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {models.map((model) => (
        <Card
          key={model.key}
          className={`border border-slate-700 bg-slate-900/50 hover:border-slate-600 transition-all`}
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg">{model.name}</CardTitle>
            <p className="text-slate-400 text-xs mt-1">Top 10 Spam Indicators</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {features.feature_importance[model.key]?.map((feature, idx) => (
                <div
                  key={idx}
                  className={`${model.bgColor} border ${model.borderColor} rounded-lg px-3 py-2 flex items-center gap-3 hover:border-opacity-100 transition-all`}
                >
                  <div className={`bg-gradient-to-r ${model.color} w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white text-xs font-bold">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">{feature}</p>
                    <p className="text-slate-500 text-xs">
                      {feature === 'free' && 'Commonly used in promotional spam'}
                      {feature === 'click' && 'CTA spam indicator'}
                      {feature === 'urgent' && 'Urgency-driven spam tactic'}
                      {feature === 'claim' && 'Prize/reward claim indicator'}
                      {feature === 'call' && 'Direct action request'}
                      {feature === 'winner' && 'Prize/lottery spam indicator'}
                      {feature === 'prize' && 'Reward/winning spam'}
                      {feature === 'win' && 'Winning/prize indicator'}
                      {feature === 'now' && 'Time-pressure tactic'}
                      {feature === 'limited' && 'Scarcity tactic'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-6 pt-4 border-t border-slate-700 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Features Analyzed</span>
                <span className="text-white font-semibold">
                  {features.feature_importance[model.key]?.length || 0}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Spam Detection Focus</span>
                <span className="text-amber-400 font-semibold">High</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
