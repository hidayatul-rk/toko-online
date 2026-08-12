import { getSetting } from "@/lib/settings";

const RAJAONGKIR_BASE = "https://api.rajaongkir.com/starter";

// Cache ongkir 1 jam (in-memory)
const costCache = new Map<string, { data: { service: string; description: string; cost: number; etd: string }[]; expiry: number }>();
const CACHE_TTL = 60 * 60 * 1000; // 1 jam

type CourierCode = "jne" | "pos" | "tiki" | "jnt" | "sicepat" | "anteraja";

export const COURIERS: { code: CourierCode; name: string }[] = [
    { code: "jne", name: "JNE" },
    { code: "pos", name: "POS Indonesia" },
    { code: "tiki", name: "TIKI" },
    { code: "jnt", name: "J&T Express" },
    { code: "sicepat", name: "SiCepat" },
    { code: "anteraja", name: "AnterAja" },
];

interface RajaOngkirCost {
    service: string;
    description: string;
    cost: { value: number; etd: string }[];
}

export async function getShippingCost(
    destinationCityId: string,
    weight: number,
    courier: CourierCode,
): Promise<{ service: string; description: string; cost: number; etd: string }[]> {
    const apiKey = await getSetting("rajaongkir_api_key", process.env.RAJAONGKIR_API_KEY ?? "");
    if (!apiKey) return [];

    // Cek cache
    const cacheKey = `${courier}:${destinationCityId}:${weight}`;
    const cached = costCache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) return cached.data;

    const originCityId = await getSetting("rajaongkir_origin_city", process.env.RAJAONGKIR_ORIGIN_CITY ?? "501");

    try {
        const res = await fetch(`${RAJAONGKIR_BASE}/cost`, {
            method: "POST",
            headers: { key: apiKey, "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                origin: originCityId,
                destination: destinationCityId,
                weight: String(Math.max(1, Math.ceil(weight))),
                courier,
            }).toString(),
        });

        const data = await res.json();
        const results = data?.rajaongkir?.results?.[0]?.costs ?? [];

        const mapped = results.map((c: RajaOngkirCost) => ({
            service: c.service,
            description: c.description,
            cost: c.cost[0]?.value ?? 0,
            etd: c.cost[0]?.etd ?? "-",
        }));

        costCache.set(cacheKey, { data: mapped, expiry: Date.now() + CACHE_TTL });
        return mapped;
    } catch {
        return [];
    }
}

export async function getCityId(
    cityName: string,
    provinceName: string,
): Promise<string | null> {
    const apiKey = await getSetting("rajaongkir_api_key", process.env.RAJAONGKIR_API_KEY ?? "");
    if (!apiKey) return null;

    try {
        const res = await fetch(`${RAJAONGKIR_BASE}/city`, {
            headers: { key: apiKey },
        });
        const data = await res.json();
        const cities = data?.rajaongkir?.results ?? [];

        const found = cities.find(
            (c: { city_name: string; province: string }) =>
                c.city_name.toLowerCase().includes(cityName.toLowerCase()) &&
                c.province.toLowerCase().includes(provinceName.toLowerCase()),
        );

        return found?.city_id ?? null;
    } catch {
        return null;
    }
}
