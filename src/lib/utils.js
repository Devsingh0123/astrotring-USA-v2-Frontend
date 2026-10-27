import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
}

/**
 * Format currency with proper symbol and locale formatting
 * @param {number|string} amount - price
 * @param {string} currency - "INR", "USD"
 * @param {Object} [options]
 * @param {boolean} [options.showDecimals] - force displaying decimals
 * @returns {string} e.g. "₹799", "$9.99", "£8.50"
 */
export function formatCurrency(amount, currency = "INR", options = {}) {
  const num = Number(amount) || 0
  const curr = String(currency || "INR").toUpperCase()
  const symbol = CURRENCY_SYMBOLS[curr] || `${curr} `

  if (curr === "INR") {
    const isWhole = num % 1 === 0 && !options.showDecimals
    return `${symbol}${num.toLocaleString("en-IN", {
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: 2,
    })}`
  }

  const isWhole = num % 1 === 0 && !options.showDecimals
  return `${symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Safe extractor for dynamic pack pricing whether returned at top-level
 * or inside nested `prices` object (per currency or direct).
 * @param {Object} pkg - pack object from API
 * @param {string} currentCurrency - active currency code
 * @returns {{ originalPrice: number, offerPrice: number, currency: string }}
 */
export function getPackPricing(pkg, currentCurrency = "INR") {
  if (!pkg) {
    return { originalPrice: 0, offerPrice: 0, currency: currentCurrency || "INR" }
  }

  const curr = String(pkg.currency || currentCurrency || "INR").toUpperCase()

  // Handle nested prices JSON if present (e.g. { INR: { originalPrice, offerPrice } } or { originalPrice, offerPrice })
  const nested =
    pkg.prices && typeof pkg.prices === "object" && !Array.isArray(pkg.prices)
      ? pkg.prices[curr] || pkg.prices["INR"] || pkg.prices
      : null

  const original =
    pkg.originalPrice !== undefined && pkg.originalPrice !== null
      ? pkg.originalPrice
      : nested?.originalPrice !== undefined && nested?.originalPrice !== null
      ? nested.originalPrice
      : pkg.offerPrice !== undefined && pkg.offerPrice !== null
      ? pkg.offerPrice
      : nested?.offerPrice ?? 0

  const offer =
    pkg.offerPrice !== undefined && pkg.offerPrice !== null
      ? pkg.offerPrice
      : nested?.offerPrice !== undefined && nested?.offerPrice !== null
      ? nested.offerPrice
      : original

  return {
    originalPrice: Number(original) || 0,
    offerPrice: Number(offer) || 0,
    currency: curr,
  }
}
