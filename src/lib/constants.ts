export const PRICES = {
  MONTH: 120,
  YEAR: 300,
  LIFETIME: 400,
  HWID_RESET: 110,
} as const;

export const PLAN_DAYS: Record<string, number | null> = {
  MONTH: 30,
  YEAR: 365,
  LIFETIME: null,
};

export const SUPERADMIN_EMAILS = [
  "aurelumdlc@gmail.com",
  "yuzijoski@gmail.com",
  "aureliumdlc@gmail.com",
];

export const SUPPORT = {
  telegram: "@los_angeles_love",
  email: "aureliumdlc@gmail.com",
};

export const HEARTBEAT_INTERVAL_MS = 10 * 60 * 1000;

export const USDT_WALLET_DEFAULT = "TGDig9LgLMeRkz9joapULvzXNjadkRf6GJ";
