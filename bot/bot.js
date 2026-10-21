'use strict';

/**
 * TTM Massage Landing — Telegram Bot
 *
 * Функції:
 *  1. Перевірка підписки на канал @pro_telo_niko при кожному зверненні
 *  2. Перевірка коду знижки (з JSON-таблиці codes.json)
 *
 * Запуск: node bot.js
 * .env потрібен: BOT_TOKEN=<your_token>
 */

const TelegramBot  = require('node-telegram-bot-api');
const fs           = require('fs');
const path         = require('path');
require('dotenv').config();

const TOKEN      = process.env.BOT_TOKEN;
const CHANNEL_ID = '@pro_telo_niko';   // публічний username каналу
const CODES_FILE = path.join(__dirname, 'codes.json');

if (!TOKEN) {
  console.error('❌  BOT_TOKEN не знайдено в .env');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

/* ─── Завантажити коди знижок ─── */
function loadCodes() {
  try {
    return JSON.parse(fs.readFileSync(CODES_FILE, 'utf8'));
  } catch {
    return {};
  }
}

/* ─── Перевірити підписку на канал ─── */
async function isSubscribed(userId) {
  try {
    const member = await bot.getChatMember(CHANNEL_ID, userId);
    return ['member', 'administrator', 'creator'].includes(member.status);
  } catch {
    // якщо бот не має доступу до каналу — пропускаємо перевірку
    return true;
  }
}

/* ─── Клавіатура головного меню ─── */
const MAIN_KEYBOARD = {
  reply_markup: {
    keyboard: [
      [{ text: '🎟 Перевірити код знижки' }],
      // [{ text: '📅 Онлайн-запис' }],   // розблокувати пізніше
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

/* ─── Повідомлення "підпишись" ─── */
function subscribeMsg() {
  return {
    text: '👋 Щоб скористатися ботом, потрібно підписатись на наш канал:\n\nhttps://t.me/pro_telo_niko\n\nПісля підписки натисни /start',
    options: {
      reply_markup: {
        inline_keyboard: [[
          { text: '📢 Підписатись на канал', url: 'https://t.me/pro_telo_niko' },
        ]],
      },
    },
  };
}

/* ─── Мідлвар: перевірка підписки ─── */
async function checkSubscription(msg, next) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // /start завжди дозволений (щоб показати кнопку підписки)
  if (msg.text === '/start') { next(); return; }

  const subscribed = await isSubscribed(userId);
  if (!subscribed) {
    const { text, options } = subscribeMsg();
    await bot.sendMessage(chatId, text, options);
    return;
  }
  next();
}

/* ─── Стан: очікуємо код від користувача ─── */
const waitingForCode = new Set();

/* ════════════════════════════════════════
   HANDLERS
═══════════════════════════════════════ */

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const subscribed = await isSubscribed(userId);
  if (!subscribed) {
    const { text, options } = subscribeMsg();
    await bot.sendMessage(chatId, text, options);
    return;
  }

  await bot.sendMessage(
    chatId,
    '👋 Привіт! Я бот студії масажу *Час для себе*.\n\nОбери дію 👇',
    { parse_mode: 'Markdown', ...MAIN_KEYBOARD }
  );
});

/* ─── Кнопка «Перевірити код знижки» ─── */
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text   = msg.text || '';

  // Перевірка підписки перед кожною дією (крім /start)
  if (text !== '/start') {
    const subscribed = await isSubscribed(msg.from.id);
    if (!subscribed) {
      const { text: txt, options } = subscribeMsg();
      await bot.sendMessage(chatId, txt, options);
      return;
    }
  }

  /* Меню: перевірити код */
  if (text === '🎟 Перевірити код знижки') {
    waitingForCode.add(chatId);
    await bot.sendMessage(
      chatId,
      '🔑 Введи свій код знижки (наприклад: TTM1A0BTEST):',
      {
        reply_markup: {
          keyboard: [[{ text: '❌ Скасувати' }]],
          resize_keyboard: true,
        },
      }
    );
    return;
  }

  /* Скасувати введення коду */
  if (text === '❌ Скасувати') {
    waitingForCode.delete(chatId);
    await bot.sendMessage(chatId, '↩️ Скасовано.', MAIN_KEYBOARD);
    return;
  }

  /* Обробка коду знижки */
  if (waitingForCode.has(chatId)) {
    waitingForCode.delete(chatId);
    const code  = text.trim().toUpperCase();
    const codes = loadCodes();

    if (codes[code]) {
      const { discount, desc } = codes[code];
      await bot.sendMessage(
        chatId,
        `✅ Код *${code}* дійсний!\n\n🎉 Твоя знижка: *${discount}*\n_${desc}_\n\n📞 Назви цей код при записі на сеанс.`,
        { parse_mode: 'Markdown', ...MAIN_KEYBOARD }
      );
    } else {
      await bot.sendMessage(
        chatId,
        `❌ Код *${code}* не знайдений або вже використаний.\n\nПеревір правильність введення або зіграй у лотерею знову на сайті.`,
        { parse_mode: 'Markdown', ...MAIN_KEYBOARD }
      );
    }
    return;
  }
});

console.log('✅  Бот запущено. Очікую повідомлення...');
