/** Safe Intl formatting with graceful fallback per ISO 4217 code. */
export function formatMoneySafe(amount: number, currencyCode: string): string {
  const cur = (currencyCode || "EUR").toUpperCase().slice(0, 8);
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur.length === 3 ? cur : "EUR",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${cur}`;
  }
}
