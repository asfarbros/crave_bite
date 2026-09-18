export const VIZ = {
  revenue: "#2a78d6",
  accent: "#eb6834",
  grid: "#e1e0d9",
  axis: "#c3c2b7",
  muted: "#898781",
  surface: "#fcfcfb",
  track: "#f1f0ed"
};

export const formatCurrency = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;

// Compact form is for axis ticks and other tight spots; tiles show exact values.
export const formatCompactCurrency = (n) => {
  const value = n || 0;
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${Math.round(value)}`;
};

export const formatNumber = (n) => (n || 0).toLocaleString("en-IN");

export const percentChange = (current, previous) => {
  if (previous === null || previous === undefined) return null;
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};
