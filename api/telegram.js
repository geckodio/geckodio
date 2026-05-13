const DEFAULT_CHAT_IDS = ["996714848"];

function getTelegramConfig() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const rawIds =
    process.env.TELEGRAM_CHAT_IDS ||
    process.env.TELEGRAM_CHAT_ID ||
    DEFAULT_CHAT_IDS.join(",");
  const chatIds = rawIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return { botToken, chatIds };
}

function sanitize(value, maxLength = 1200) {
  return String(value || "").trim().slice(0, maxLength);
}

function validatePayload(payload) {
  const name = sanitize(payload.name, 120);
  const phone = sanitize(payload.phone, 80);
  const email = sanitize(payload.email, 180);
  const message = sanitize(payload.message, 1600);
  const page = sanitize(payload.page, 600);

  if (!name || !phone || !email || !message) {
    return { ok: false, error: "Заполните все поля" };
  }

  return { ok: true, data: { name, phone, email, message, page } };
}

function formatTelegramMessage(data) {
  return [
    "Новая заявка с сайта Геккодио",
    "",
    `Имя: ${data.name}`,
    `Телефон: ${data.phone}`,
    `Email: ${data.email}`,
    "",
    `Что нужно сделать: ${data.message}`,
    data.page ? `Страница: ${data.page}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendTelegramMessage(botToken, chatId, text) {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || !json.ok) {
    throw new Error(json.description || `Telegram error ${response.status}`);
  }
}

async function handleTelegramRequest(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: "Method not allowed" }));
    return;
  }

  const { botToken, chatIds } = getTelegramConfig();
  if (!botToken || !chatIds.length) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, error: "Telegram is not configured" }));
    return;
  }

  const validation = validatePayload(req.body || {});
  if (!validation.ok) {
    res.statusCode = 400;
    res.end(JSON.stringify({ ok: false, error: validation.error }));
    return;
  }

  try {
    const text = formatTelegramMessage(validation.data);
    await Promise.all(chatIds.map((id) => sendTelegramMessage(botToken, id, text)));
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true }));
  } catch (error) {
    console.error("[telegram] submit failed:", error);
    res.statusCode = 502;
    res.end(JSON.stringify({ ok: false, error: "Не удалось отправить заявку" }));
  }
}

module.exports = handleTelegramRequest;
