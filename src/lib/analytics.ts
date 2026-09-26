declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const initGA = (measurementId: string) => {
  if (!measurementId || typeof window === 'undefined') return;
  
  if (document.getElementById('ga-script')) return; // Evita carregar múltiplas vezes

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  }
  window.gtag('js', new Date());
  
  window.gtag('config', measurementId, {
    send_page_view: false, // Disparamos manualmente devido ao SPA
  });
};

export const trackPageView = (path: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
};

export const trackViewItem = (product: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'BRL',
      value: product.isPromo ? (product.promoPrice ?? product.price) : product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.isPromo ? (product.promoPrice ?? product.price) : product.price,
      }]
    });
  }
};

export const trackAddToCart = (product: any, quantity: number, customizations?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const price = product.isPromo ? (product.promoPrice ?? product.price) : product.price;
    window.gtag('event', 'add_to_cart', {
      currency: 'BRL',
      value: price * quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: price,
        quantity: quantity
      }],
      custom_data: customizations ? 'has_customizations' : 'none'
    });
  }
};

export const trackViewCart = (cart: any[], totalValue: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_cart', {
      currency: 'BRL',
      value: totalValue,
      items: cart.map(item => {
        const price = item.product.isPromo ? (item.product.promoPrice ?? item.product.price) : item.product.price;
        return {
          item_id: item.product.id,
          item_name: item.product.name,
          item_category: item.product.category,
          price: price,
          quantity: item.quantity
        };
      })
    });
  }
};

export const trackBeginCheckout = (cart: any[], totalValue: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'BRL',
      value: totalValue,
      items: cart.map(item => {
        const price = item.product.isPromo ? (item.product.promoPrice ?? item.product.price) : item.product.price;
        return {
          item_id: item.product.id,
          item_name: item.product.name,
          item_category: item.product.category,
          price: price,
          quantity: item.quantity
        };
      })
    });
  }
};

export const trackOrderCreated = (orderId: string, value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    // Usamos 'generate_lead' para representar o envio do orçamento via WhatsApp
    window.gtag('event', 'generate_lead', {
      currency: 'BRL',
      value: value,
      transaction_id: orderId // Não envia dados pessoais
    });
    
    // Preparação para futura conversão de compra ('purchase')
    // Quando tivermos pagamento, usaremos 'purchase'
  }
};

export const trackKitStarted = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'kit_started', {
      event_category: 'engagement',
      event_label: 'Kit Builder'
    });
  }
};

export const trackKitCompleted = (components: string[], value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'kit_completed', {
      event_category: 'engagement',
      event_label: 'Kit Builder',
      value: value,
      currency: 'BRL',
      components_count: components.length
    });
  }
};
