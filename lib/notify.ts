// Мгновенное уведомление в Telegram, когда кто-то написал в поддержку.
// Работает, только если заданы TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID; иначе тихо ничего не делает.
export async function notifyTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 3500) }),
    });
  } catch (err) {
    console.error('notifyTelegram: не удалось отправить', err);
  }
}
