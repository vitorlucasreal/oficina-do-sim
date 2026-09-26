import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { AdminProduct } from "../components/admin/types";
import { isUUID } from "../utils/categoryUtils";

export function useAdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        const transformedProducts: AdminProduct[] = data.map((item) => ({
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
          active: item.active,
          legacy_id: item.legacy_id,
        }));
        
        setProducts(transformedProducts);
      }
    } catch (err: any) {
      console.error("Error fetching admin products:", err);
      setError("Não foi possível carregar os produtos no momento.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return { products, loading, error, refetch: fetchProducts };
}
