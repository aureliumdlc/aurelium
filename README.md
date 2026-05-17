# AureliumDLC

Сайт подписки для Minecraft-клиента AureliumDLC: лендинг, авторизация, личный кабинет, магазин (USDT TRC20), админка и API для лаунчера.

## Стек (бесплатно)

- **Next.js 16** — фронт + API
- **SQLite + Prisma** — локально; для продакшена — [Neon](https://neon.tech) (бесплатный Postgres)
- **Vercel** — хостинг с GitHub (бесплатный тариф, API работает)
- **Resend** — письма (бесплатно 3000/мес)
- **GitHub** — репозиторий

> Чистый GitHub Pages не поддерживает API. Репозиторий на GitHub, деплой на Vercel — бесплатно и с полным бэкендом.

## Запуск локально

```bash
cd aurelium-dlc
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

Откройте http://localhost:3000

## Админы по умолчанию

При регистрации с email:

- `aurelumdlc@gmail.com`
- `yuzijoski@gmail.com`
- `aureliumdlc@gmail.com`

назначается роль **SUPERADMIN** (может назначать других админов).

## API (лаунчер)

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Вход (+ 2FA) |
| POST | `/api/auth/refresh` | Обновление токена |
| POST | `/api/hwid/bind` | Привязка HWID |
| POST | `/api/hwid/reset` | Сброс HWID (110 ₽) |
| GET | `/api/license/status` | Статус лицензии |
| POST | `/api/heartbeat` | Пинг каждые 10 мин |
| POST | `/api/payment/callback` | Webhook оплаты |

Заголовок: `Authorization: Bearer <accessToken>`

## Тарифы

| План | RUB | EN (ориентир) |
|------|-----|----------------|
| Месяц | 120 ₽ | ~$1.30 |
| Год | 300 ₽ | ~$3.25 |
| Навсегда | 400 ₽ | ~$4.35 |
| Сброс HWID | 110 ₽ | — |

## Деплой на Vercel

1. Залейте репозиторий на GitHub
2. Импортируйте проект в [vercel.com](https://vercel.com)
3. Добавьте переменные из `.env.example`
4. Для БД: создайте Neon Postgres и укажите `DATABASE_URL`
5. `npx prisma migrate deploy` через Vercel build command:

```json
"build": "prisma generate && prisma migrate deploy && next build"
```

## USDT TRC20

Укажите `USDT_TRC20_WALLET` в `.env`. После интеграции крипто-шлюза вызывайте `POST /api/payment/callback` с заголовком `x-payment-secret` и телом `{ "externalId": "...", "status": "completed" }`.

Пока оплату можно подтверждать вручную через админку (выдача лицензии).

## Поддержка

- Telegram: [@los_angeles_love](https://t.me/los_angeles_love)
- Email: aureliumdlc@gmail.com
