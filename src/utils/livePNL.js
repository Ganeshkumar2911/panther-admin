import { useTickerStore } from '@/stores/ws/ticker'

export function livePNL(trade) {

  // ✅ If trade already closed
  // return backend pnl only
  if (trade?.status !== 'OPEN') {
    return Number(trade?.pnl || 0).toFixed(2)
  }

  const tickerStore = useTickerStore()

  // ✅ Get live market data
  const livePrice = tickerStore.getLastPrice(trade?.symbol)

  if (!livePrice) {
    return '0.00'
  }

  const entryPrice = Number(trade?.entry_price || 0)

  // support both lot & quantity
  const lot = Number(
    trade?.lot ||
    trade?.quantity ||
    1
  )

  let pnl = 0

  // ✅ BUY Trade
  if (trade?.type === 'BUY') {

    // close happens at BID
    const currentPrice = Number(livePrice?.bid || 0)

    pnl = (currentPrice - entryPrice) * lot
  }

  // ✅ SELL Trade
  else if (trade?.type === 'SELL') {

    // close happens at ASK
    const currentPrice = Number(livePrice?.ask || 0)

    pnl = (entryPrice - currentPrice) * lot
  }

  return Number(pnl).toFixed(2)
}