import { Resend } from 'resend'

let resendInstance: Resend | null = null
function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY || 'missing')
  }
  return resendInstance
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://hochzeit.natascha-florian.com'

interface GuestConfirmationData {
  guestName: string
  guestEmail: string
  guestCode: string
  status: 'attending' | 'declined'
  guests?: number
  accommodation?: string
  dietary?: string
  message?: string
}

export async function sendGuestConfirmation(data: GuestConfirmationData) {
  const isAttending = data.status === 'attending'
  const magicLink = `${SITE_URL}/api/auth/magic?code=${data.guestCode}&redirect=/dashboard`

  const statusText = isAttending
    ? 'Vielen Dank für deine Zusage! Wir freuen uns riesig, dich bei unserer Hochzeit dabei zu haben.'
    : 'Schade, dass du nicht kommen kannst. Danke für die Rückmeldung!'

  const detailsLines: string[] = []

  if (isAttending) {
    if (data.guests) {
      detailsLines.push(`👥 <strong>Personen:</strong> ${data.guests}`)
    }
    if (data.accommodation === 'needed') {
      detailsLines.push('🏠 <strong>Unterkunft:</strong> Ja, wird benötigt')
    } else if (data.accommodation === 'not-needed') {
      detailsLines.push('🏠 <strong>Unterkunft:</strong> Nein, nicht benötigt')
    }
    if (data.dietary) {
      detailsLines.push(`🍽️ <strong>Essenswünsche:</strong> ${data.dietary}`)
    } else {
      detailsLines.push('🍽️ <strong>Essenswünsche:</strong> Keine Angaben')
    }
  }

  if (data.message) {
    detailsLines.push(`💬 <em>„${data.message}"</em>`)
  }

  const detailsHtml = detailsLines.length > 0
    ? `<div style="background: #f9f9f6; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
        ${detailsLines.map(l => `<p style="margin: 6px 0; font-size: 15px; color: #333;">${l}</p>`).join('')}
       </div>`
    : ''

  const html = `
    <div style="font-family: 'Georgia', serif; max-width: 560px; margin: 0 auto; padding: 32px 20px; color: #2d3a2d;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 28px; color: #2d6a4f; margin: 0;">Natascha & Florian</h1>
        <p style="font-size: 16px; color: #666; margin: 4px 0 0;">19. September 2026</p>
        <p style="font-size: 32px; margin: 16px 0 0;">${isAttending ? '🎉' : '🧡'}</p>
      </div>

      <p style="font-size: 18px; color: #333;">
        Hallo ${data.guestName}!
      </p>

      <p style="font-size: 16px; color: #444; line-height: 1.6;">
        ${statusText}
      </p>

      ${detailsHtml}

      <div style="text-align: center; margin: 32px 0;">
        <a href="${magicLink}" 
           style="background: #c1121f; color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-size: 16px; font-weight: 600; display: inline-block;">
          → Zurück zur Website
        </a>
      </div>

      <p style="font-size: 13px; color: #888; text-align: center;">
        Einfach anklicken – du bist automatisch eingeloggt
      </p>

      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e0e0e0;">
        <p style="font-size: 16px; color: #333; margin-bottom: 4px;">Liebe Grüße,</p>
        <p style="font-size: 18px; color: #2d6a4f; margin: 0;">Natascha & Florian</p>
        <p style="font-size: 12px; color: #999; margin-top: 16px;">
          Dein persönlicher Zugangscode: <strong>${data.guestCode}</strong><br>
          Falls der Button nicht funktioniert: <a href="${magicLink}" style="color: #2d6a4f;">${magicLink}</a>
        </p>
      </div>
    </div>
  `

  try {
    const { error } = await getResend().emails.send({
      from: 'Natascha & Florian <noreply@natascha-florian.com>',
      to: [data.guestEmail],
      subject: isAttending
        ? '🎉 Deine Zusage – Natascha & Florian heiraten!'
        : 'Deine Rückmeldung – Natascha & Florian heiraten',
      html,
    })

    if (error) {
      console.error('[Guest Email] Resend error:', error)
      return false
    }

    console.log('[Guest Email] Sent to', data.guestEmail)
    return true
  } catch (err) {
    console.error('[Guest Email] Exception:', err)
    return false
  }
}

export async function sendRSVPEmail(data: {
  guestName: string
  guestEmail: string
  status: 'attending' | 'declined'
  guests?: number
  accommodation?: string
  dietary?: string
  message?: string
}) {
  const adminEmail = process.env.ADMIN_EMAIL || 'florian.kuehn96@gmx.de'
  const isAttending = data.status === 'attending'

  const details: string[] = []
  if (isAttending && data.guests) {
    details.push(`**Anzahl Personen:** ${data.guests}`)
  }
  if (data.accommodation === 'needed') {
    details.push('**Unterkunft:** Benötigt')
  }
  if (data.dietary) {
    details.push(`**Essenswünsche:** ${data.dietary}`)
  }
  if (data.message) {
    details.push(`**Nachricht:** ${data.message}`)
  }

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${isAttending ? '#2d6a4f' : '#c1121f'};">
        ${isAttending ? '🎉 Neue Zusage' : '❌ Neue Absage'}
      </h2>
      <p><strong>${data.guestName}</strong> (${data.guestEmail || 'keine E-Mail'}) hat ${isAttending ? 'zugesagt' : 'abgesagt'}.</p>
      ${details.length > 0 ? '<hr/><ul>' + details.map(d => `<li>${d}</li>`).join('') + '</ul>' : ''}
      <hr/>
      <p style="color: #666; font-size: 12px;">
        Automatisch von hochzeit.natascha-florian.com gesendet.
      </p>
    </div>
  `

  try {
    const { error } = await getResend().emails.send({
      from: 'Hochzeit <noreply@natascha-florian.com>',
      to: [adminEmail],
      subject: isAttending ? `🎉 Zusage: ${data.guestName}` : `Absage: ${data.guestName}`,
      html,
    })

    if (error) {
      console.error('[RSVP Email] Resend error:', error)
      return false
    }
    return true
  } catch (err) {
    console.error('[RSVP Email] Exception:', err)
    return false
  }
}