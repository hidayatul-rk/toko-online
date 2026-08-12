import { prisma } from "@/lib/prisma";

export async function getSetting(key: string, fallback = ""): Promise<string> {
    try {
        const setting = await prisma.setting.findUnique({ where: { key } });
        return setting?.value || fallback;
    } catch {
        return fallback;
    }
}
