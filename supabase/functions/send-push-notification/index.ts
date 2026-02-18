// supabase/functions/send-push-notification/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'
import webpush from 'npm:web-push@3.6.7'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
    const vapidPublicKey = 'BB8kU2idNZuS0R1MnsbmtL_aGUDaON0eWoV4NyCZ3gLdgKVQ9xDPfOAsa1SmPsvah5RJ11_ZjUW44hCr-pm2jtc'

    if (!vapidPrivateKey) throw new Error('VAPID_PRIVATE_KEY is missing')

    webpush.setVapidDetails('mailto:admin@sublist.com', vapidPublicKey, vapidPrivateKey)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. 활성 구독 데이터 가져오기
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
    
    if (subError) throw subError

    // 2. 한국 시간 기준 오늘/내일 날짜 계산
    const now = new Date(new Date().getTime() + (9 * 60 * 60 * 1000))
    const today = now.getDate()
    const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000)).getDate()

    const targetUsers = new Map()
    subscriptions?.forEach(sub => {
      const match = sub.billing_date.match(/\d+/)
      if (!match) return
      const day = parseInt(match[0], 10)
      
      if (day === today || day === tomorrow) {
        if (!targetUsers.has(sub.user_id)) targetUsers.set(sub.user_id, [])
        targetUsers.get(sub.user_id).push({ ...sub, isToday: day === today })
      }
    })

    // 3. 푸시 발송
    let sentCount = 0
    for (const [userId, items] of targetUsers) {
      const { data: pushSubs } = await supabase.from('push_subscriptions').select('*').eq('user_id', userId)
      if (!pushSubs || pushSubs.length === 0) continue

      const todayCount = items.filter(i => i.isToday).length
      const tomorrowCount = items.length - todayCount
      
      let title = '구독 결제 예정 알림'
      let body = ''

      if (todayCount > 0 && tomorrowCount > 0) {
        body = `오늘 ${todayCount}건, 내일 ${tomorrowCount}건의 결제가 예정되어 있습니다.`
      } else if (todayCount > 0) {
        body = todayCount === 1 ? `오늘 ${items[0].service_name} 결제 예정` : `오늘 총 ${todayCount}건의 결제 예정`
      } else {
        body = tomorrowCount === 1 ? `내일 ${items[0].service_name} 결제 예정` : `내일 총 ${tomorrowCount}건의 결제 예정`
      }

      const payload = JSON.stringify({ title, body, url: '/calendar' })

      for (const ps of pushSubs) {
        try {
          await webpush.sendNotification({
            endpoint: ps.endpoint,
            keys: { p256dh: ps.p256dh, auth: ps.auth }
          }, payload)
          sentCount++
        } catch (e) {
          if (e.statusCode === 410 || e.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('id', ps.id)
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, sent: sentCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  }
})
