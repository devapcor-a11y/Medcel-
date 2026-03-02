export async function fetchExchangeRate(
  type: 'blue' | 'oficial' | 'mep' = 'blue'
) {
  try {
    const res = await fetch(`https://dolarapi.com/v1/dolares/${type}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    const data = await res.json();
    return {
      compra: data.compra,
      venta: data.venta,
      moneda: data.moneda,
      fechaActualizacion: data.fechaActualizacion,
    };
  } catch (error) {
    console.error(`Failed to fetch ${type} exchange rate`, error);
    // Fallback values so the app doesn't crash
    return {
      compra: 1000,
      venta: 1050,
      moneda: 'USD',
      fechaActualizacion: new Date().toISOString(),
    };
  }
}

export function formatArs(amount: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUsd(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
