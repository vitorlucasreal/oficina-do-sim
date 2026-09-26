import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabase";
import { CartItem, Product, Customizations } from "../types";
import { User } from "@supabase/supabase-js";
import { trackAddToCart } from "../lib/analytics";

export function useCartSync(user: User | null) {
  const [cart, setCartState] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("oficina_sim_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isSyncing = useRef(false);

  useEffect(() => {
    if (!user) {
      const localCartRaw = localStorage.getItem("oficina_sim_cart");
      setCartState(localCartRaw ? JSON.parse(localCartRaw) : []);
      return;
    }

    const syncCart = async () => {
      if (isSyncing.current) return;
      isSyncing.current = true;

      try {
        const { data: remoteItems, error } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        const remoteCart: CartItem[] = (remoteItems || []).map(row => ({
          id: row.id,
          product: row.product_data,
          quantity: row.quantity,
          customizations: row.customizations
        }));

        const localCartRaw = localStorage.getItem("oficina_sim_cart");
        const localCart: CartItem[] = localCartRaw ? JSON.parse(localCartRaw) : [];

        const mergedCart = [...remoteCart];
        
        for (const localItem of localCart) {
          const existingIdx = mergedCart.findIndex(
            (item) => item.product.id === localItem.product.id && JSON.stringify(item.customizations) === JSON.stringify(localItem.customizations)
          );

          if (existingIdx > -1) {
            mergedCart[existingIdx].quantity += localItem.quantity;
            await supabase
              .from("cart_items")
              .update({ quantity: mergedCart[existingIdx].quantity })
              .eq("id", mergedCart[existingIdx].id);
          } else {
            const { data: newItem, error: insertError } = await supabase
              .from("cart_items")
              .insert({
                user_id: user.id,
                product_id: localItem.product.id.startsWith("custom-kit") ? null : localItem.product.id,
                product_data: localItem.product,
                quantity: localItem.quantity,
                customizations: localItem.customizations
              })
              .select()
              .single();

            if (!insertError && newItem) {
              mergedCart.push({
                id: newItem.id,
                product: newItem.product_data,
                quantity: newItem.quantity,
                customizations: newItem.customizations
              });
            }
          }
        }

        setCartState(mergedCart);
        localStorage.removeItem("oficina_sim_cart");

      } catch (e) {
        console.error("Error syncing cart", e);
      } finally {
        isSyncing.current = false;
      }
    };

    syncCart();
  }, [user]);

  const addToCart = async (product: Product, quantity: number = 1, customizations?: Customizations) => {
    trackAddToCart(product, quantity, customizations);
    
    let newItemId = customizations ? `${product.id}-${Date.now()}` : product.id;
    let existingIdx = cart.findIndex(
      (item) => item.product.id === product.id && JSON.stringify(item.customizations) === JSON.stringify(customizations)
    );

    if (user) {
      if (existingIdx > -1) {
        const itemToUpdate = cart[existingIdx];
        const newQuantity = itemToUpdate.quantity + quantity;
        const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", itemToUpdate.id);
        if (!error) {
          setCartState(prev => prev.map(item => item.id === itemToUpdate.id ? { ...item, quantity: newQuantity } : item));
        }
      } else {
        const { data, error } = await supabase.from("cart_items").insert({
          user_id: user.id,
          product_id: product.id.startsWith("custom-kit") ? null : product.id,
          product_data: product,
          quantity,
          customizations
        }).select().single();

        if (!error && data) {
          setCartState(prev => [...prev, { id: data.id, product: data.product_data, quantity: data.quantity, customizations: data.customizations }]);
        }
      }
    } else {
      // Local storage logic
      setCartState(prev => {
        const updated = [...prev];
        if (existingIdx > -1) {
          updated[existingIdx].quantity += quantity;
        } else {
          updated.push({ id: newItemId, product, quantity, customizations });
        }
        localStorage.setItem("oficina_sim_cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (user) {
      const { error } = await supabase.from("cart_items").delete().eq("id", cartItemId);
      if (!error) {
        setCartState(prev => prev.filter(item => item.id !== cartItemId));
      }
    } else {
      setCartState(prev => {
        const updated = prev.filter(item => item.id !== cartItemId);
        localStorage.setItem("oficina_sim_cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (user) {
      const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", cartItemId);
      if (!error) {
        setCartState(prev => prev.map(item => item.id === cartItemId ? { ...item, quantity } : item));
      }
    } else {
      setCartState(prev => {
        const updated = prev.map(item => item.id === cartItemId ? { ...item, quantity } : item);
        localStorage.setItem("oficina_sim_cart", JSON.stringify(updated));
        return updated;
      });
    }
  };

  const clearCart = () => {
    setCartState([]);
    if (!user) {
      localStorage.removeItem("oficina_sim_cart");
    }
  };

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart };
}
