// Real coin wallet. Balance comes from the user profile (/me) and is updated
// from the server response after each topup/gift.
export function useWallet() {
  const { me } = useMe()
  const coins = useState<number>('wallet_coins', () => 0)

  watchEffect(() => {
    if (me.value)
      coins.value = me.value.coins
  })

  async function topup(packId: string) {
    const r = await $fetch<{ coins: number }>('/api/wallet/topup', { method: 'POST', body: { pack_id: packId } })
    coins.value = r.coins
  }

  async function gift(giftId: string) {
    const r = await $fetch<{ coins: number }>('/api/wallet/gift', { method: 'POST', body: { gift_id: giftId } })
    coins.value = r.coins
  }

  return { coins, topup, gift }
}
