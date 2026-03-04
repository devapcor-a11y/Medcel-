export async function fetchExchangeRate(
  type: 'blue' | 'oficial' | 'mep' | 'cripto' = 'blue'
) {
  try {
    const res = await fetch(`https://dolarapi.com/v1/dolares/${type}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!res.ok) {
      throw new Error(`API returned status: ${res.status}`);
    }
    const data = await res.json();
    return {
      compra: data?.compra || 1000,
      venta: data?.venta || 1050,
      moneda: data?.moneda || 'USD',
      fechaActualizacion: data?.fechaActualizacion || new Date().toISOString(),
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
  return `USD ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export async function getActiveExchangeRate(supabaseClient: any) {
  const { data } = await supabaseClient
    .from('configuracion')
    .select('valor')
    .eq('clave', 'tipo_cambio_preferido')
    .single();

  let val = data?.valor || 'blue';
  if (typeof val === 'string' && val.startsWith('"')) {
    val = JSON.parse(val);
  }

  // Ensure the config value is a valid enum type for the api
  const validTypes = ['blue', 'oficial', 'mep', 'cripto'] as const;
  const typeStr = validTypes.includes(val as any) ? val : 'blue';

  return await fetchExchangeRate(typeStr as any);
}
