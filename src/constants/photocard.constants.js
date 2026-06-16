const monthlyLimit = Number(process.env.MONTHLY_PHOTOCARD_CREATION_LIMIT);

export const MONTHLY_PHOTOCARD_CREATION_LIMIT = Number.isNaN(monthlyLimit)
  ? 3
  : monthlyLimit;
