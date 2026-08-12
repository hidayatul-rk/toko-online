import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

    const products = await prisma.product.findMany({
        select: { slug: true, updatedAt: true },
    });

    const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
        url: `${baseUrl}/produk/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${baseUrl}/produk`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        ...productUrls,
    ];
}
