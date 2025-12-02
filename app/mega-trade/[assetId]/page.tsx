"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function MegaTradePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const assetId = params?.assetId as string

  const [asset, setAsset] = useState<any>(null)
  const [selectedOption, setSelectedOption] = useState<"staking" | "ai-auto">("staking")
  const [tradeAmount, setTradeAmount] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  const handleMegaTrade = () => {
    const amount = Number.parseFloat(tradeAmount)

    if (isNaN(amount) || amount < 50000) {
      alert("Minimum trade amount for MEGA TRADE is $50,000")
      return
    }

    alert(`MEGA TRADE placed! This feature requires admin approval. Selected: ${selectedOption}`)
  }

  if (loading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="text-slate-400 hover:text-white">
            ← Back
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            MEGA TRADE 🚀
          </h1>
        </div>

        <Card className="bg-slate-900/80 border-slate-700 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Select MEGA TRADE Option</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedOption("staking")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedOption === "staking"
                    ? "bg-purple-900/50 border-purple-500"
                    : "bg-slate-800 border-slate-600 hover:border-slate-500"
                }`}
              >
                <h3 className="text-xl font-bold text-white mb-2">1 Day Staking</h3>
                <p className="text-green-400 text-2xl font-bold mb-2">70-100% P/L</p>
                <p className="text-slate-400 text-sm">Lock your funds for 24 hours</p>
                <p className="text-slate-400 text-sm">High risk, high reward</p>
              </button>

              <button
                onClick={() => setSelectedOption("ai-auto")}
                className={`p-6 rounded-lg border-2 transition-all ${
                  selectedOption === "ai-auto"
                    ? "bg-purple-900/50 border-purple-500"
                    : "bg-slate-800 border-slate-600 hover:border-slate-500"
                }`}
              >
                <h3 className="text-xl font-bold text-white mb-2">AI Auto Trading</h3>
                <p className="text-blue-400 text-2xl font-bold mb-2">6-24 Hours</p>
                <p className="text-slate-400 text-sm">AI places automatic trades</p>
                <p className="text-slate-400 text-sm">Admin controlled results</p>
              </button>
            </div>

            <div>
              <p className="text-sm text-slate-400 mb-2">Trade Amount (Minimum: $50,000)</p>
              <Input
                type="number"
                placeholder="Enter amount"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-lg h-14"
              />
            </div>

            <Button
              onClick={handleMegaTrade}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-xl"
            >
              Place MEGA TRADE 🚀
            </Button>

            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
              <p className="text-yellow-400 font-semibold mb-2">⚠️ Important Notice</p>
              <p className="text-slate-300 text-sm">
                MEGA TRADES require admin approval. Results are controlled by the admin panel. Your funds will be locked
                for the selected duration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
