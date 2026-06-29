import { Resend } from 'resend'

export async function sendInviteEmail(
  to: string,
  sessionName: string,
  joinUrl: string,
  organizerName: string
) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'Plotluck <noreply@plotluck.app>',
    to,
    subject: `${organizerName} invited you to "${sessionName}" on Plotluck`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">🍽️ You're invited!</h1>
        <p><strong>${organizerName}</strong> invited you to join <strong>"${sessionName}"</strong> on Plotluck — the app that finds the perfect restaurant for your group.</p>
        <a href="${joinUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          Join the session
        </a>
        <p style="color: #6b7280; font-size: 14px;">This invite expires in 14 days. If you didn't expect this email, you can ignore it.</p>
      </div>
    `,
  })
}
