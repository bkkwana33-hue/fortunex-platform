"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Asset {
  id: string
  name: string
  symbol: string
  price: number
  change24h: number
}

export default function TradeListPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [assets, setAssets] = useState<Asset[]>([])
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const goldResponse = await fetch("/api/gold-price")
        const goldData = await goldResponse.json()

        // Fetch crypto prices
        const cryptoResponse = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,binancecoin,ripple,solana,dogecoin,cardano&vs_currencies=usd&include_24hr_change=true",
        )
        const cryptoData = await cryptoResponse.json()

        const formattedAssets: Asset[] = [
          {
            id: "gold",
            name: "COMEX Gold",
            symbol: "GOLD",
            price: goldData.success ? goldData.data.price : 2650.0,
            change24h: goldData.success ? goldData.data.change24h : 0,
          },
          {
            id: "bitcoin",
            name: "Bitcoin",
            symbol: "BTC",
            price: cryptoData.bitcoin?.usd || 0,
            change24h: cryptoData.bitcoin?.usd_24h_change || 0,
          },
          {
            id: "ethereum",
            name: "Ethereum",
            symbol: "ETH",
            price: cryptoData.ethereum?.usd || 0,
            change24h: cryptoData.ethereum?.usd_24h_change || 0,
          },
          {
            id: "binancecoin",
            name: "Binance Coin",
            symbol: "BNB",
            price: cryptoData.binancecoin?.usd || 0,
            change24h: cryptoData.binancecoin?.usd_24h_change || 0,
          },
          {
            id: "ripple",
            name: "Ripple",
            symbol: "XRP",
            price: cryptoData.ripple?.usd || 0,
            change24h: cryptoData.ripple?.usd_24h_change || 0,
          },
          {
            id: "solana",
            name: "Solana",
            symbol: "SOL",
            price: cryptoData.solana?.usd || 0,
            change24h: cryptoData.solana?.usd_24h_change || 0,
          },
          {
            id: "dogecoin",
            name: "Dogecoin",
            symbol: "DOGE",
            price: cryptoData.dogecoin?.usd || 0,
            change24h: cryptoData.dogecoin?.usd_24h_change || 0,
          },
          {
            id: "cardano",
            name: "Cardano",
            symbol: "ADA",
            price: cryptoData.cardano?.usd || 0,
            change24h: cryptoData.cardano?.usd_24h_change || 0,
          },
        ]

        setAssets(formattedAssets)
      } catch (error) {
        console.error("Error fetching assets:", error)
      }
    }

    fetchAssets()
    const interval = setInterval(fetchAssets, 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard")}
              className="text-slate-400 hover:text-white"
            >
              ← Back
            </Button>
            <h1 className="text-3xl font-bold text-yellow-500">Select Asset to Trade</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Balance</p>
            <p className="text-2xl font-bold text-yellow-500">${balance.toFixed(2)}</p>
          </div>
        </div>

        {/* Assets Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card
              key={asset.id}
              className="bg-slate-800/80 border-slate-700 hover:bg-slate-800 transition-all backdrop-blur-sm"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl mb-1 text-white">{asset.name}</CardTitle>
                    <p className="text-sm text-slate-400">{asset.symbol}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-3xl font-bold mb-1 text-white">
                    ${asset.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-sm font-medium ${asset.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {asset.change24h >= 0 ? "+" : ""}
                    {asset.change24h.toFixed(2)}%
                  </p>
                </div>
                <Button
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
                  onClick={() => router.push(`/trading/${asset.id}`)}
                >
                  Trade Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
