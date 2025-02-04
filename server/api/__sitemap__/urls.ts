import { IMeta, Response } from "~/types/common";
import { Product } from "~/types/product";

export default defineSitemapEventHandler(async (event) => {
    setResponseHeader(event, 'Content-Type', 'application/xml');

    const apiBase = useRuntimeConfig().public.apiBase;
    const products = await $fetch<Response<{meta: IMeta; data: {product: Product[]}}>>(`${apiBase}/product`);
    
    return products.data.data.product.map((p) => ({
        loc: `/product/detail/${p.id}`,
        lastmod: new Date(p.updatedAt).toISOString(), // Use the last updated timestamp
    }))
});
