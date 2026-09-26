import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Product } from "../types";
import { isUUID } from "../utils/categoryUtils";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("products")
          .select("*")
          .eq("active", true);

        if (supabaseError) {
          throw supabaseError;
        }

        if (data) {
          const transformedProducts: Product[] = data.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            category: item.category,
            categoryId: item.category_id && isUUID(item.category_id) ? item.category_id : null,
            image: item.image_url,
            rating: item.rating,
            customizable: item.customizable,
            isBestSeller: item.is_bestseller,
            isPromo: item.is_promo,
            promoPrice: item.promo_price,
            features: item.features || [],
            galleryImages: item.gallery_images || [],
          }));
          
          setProducts(transformedProducts);
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError("Não foi possível carregar os produtos no momento. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return { products, loading, error };
}
