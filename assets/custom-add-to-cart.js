import { ThemeEvents, CartAddEvent } from '@theme/events';
// Add to cart
document.addEventListener('click', function (evt) {
  const target = evt.target.closest('.add-to-cart') 
              || evt.target.closest('.add-to-cart-button');

  if (!target) return;
  evt.preventDefault();

  const form = target.closest('form');
  if (!form) return;

  const formData = new FormData(form);

  // ✅ Handle additional_price
  if (formData.has('properties[additional_price]')) {
    let val = parseFloat(formData.get('properties[additional_price]') || "0");

    if (val === 0) {
      formData.delete('properties[additional_price]');
    } else if (val > 0) {
      formData.set('properties[additional_price]', `${val} PKR`);
    }
  }

  // ✅ Handle comments
  const comments = document.getElementById('comments')?.value.trim();
  if (comments) {
    formData.append('properties[Additional Comment]', comments);
  }

  // ✅ Use theme-compatible cart_add_url
  fetch(Theme.routes.cart_add_url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    body: formData
  })
  .then(res => {
    if (!res.ok) throw new Error('Add to cart failed');
    return res.json();
  })
  .then((data) => {

    // 🔥 Dispatch proper CartAddEvent
    document.dispatchEvent(new CartAddEvent({}, data.id.toString(), {
      source: 'custom-script',
      productId: data.product_id,
      itemCount: data.quantity || 1
    }));

    // ✅ Fetch updated drawer sections
    return fetch('/cart?sections=cart-drawer,cart-icon-bubble');
  })
  .then(res => res.json())
  .then((sections) => {

    const drawer = document.querySelector('cart-drawer-component');

    // ✅ Update drawer HTML
    if (drawer && sections['cart-drawer']) {
      const parser = new DOMParser();
      const html = parser.parseFromString(sections['cart-drawer'], 'text/html');
      const newContent = html.querySelector('cart-drawer-component');
      if (newContent) {
        drawer.innerHTML = newContent.innerHTML;
      }
    }
 
    // ✅ Update cart count bubble
    const bubble = document.querySelector('.cart-count-bubble');
    if (bubble && sections['cart-icon-bubble']) {
      const parser = new DOMParser();
      const html = parser.parseFromString(sections['cart-icon-bubble'], 'text/html');
      const newBubble = html.querySelector('.cart-count-bubble');
      if (newBubble) {
        bubble.innerHTML = newBubble.innerHTML;
      }
    }

    // ✅ Open drawer
    if (drawer && typeof drawer.open === 'function') {
      drawer.open();
      document.getElementById("close-modal").click()
    }
  })
  .catch(err => {
    console.error('Cart error:', err);
  });
});
function fetchConfig(type = 'json') {
  const config = {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    }
  };

  if (type === 'json') {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
}
function normalizeProperties(properties) {
  const normalized = {};
  for (const key in properties) {
    if (!Object.hasOwn(properties, key)) continue;
    normalized[key.trim()] = properties[key];
  }
  return normalized;
}
function mapDiscountApplication(discountApp) {
  if (!discountApp) return null;

  return {
    title: discountApp.title || "Discount",
    value: parseFloat(discountApp.value),
    valueType:
      discountApp.value_type === "percentage"
        ? "PERCENTAGE"
        : "FIXED_AMOUNT"
  };
}
function buildPayload(cartData) {
  return {
    /*  CART LEVEL DISCOUNT (ADDED) */
    cartAppliedDiscount:
      cartData.cart_level_discount_applications &&
      cartData.cart_level_discount_applications.length
        ? mapDiscountApplication(
            cartData.cart_level_discount_applications[0]
          )
        : null,

    lineItems: cartData.items
      .map(item => {
        const props = normalizeProperties(item.properties || {});
        const extraPrice = parseFloat(props.additional_price || "0") || 0;

        if (extraPrice === 0) {
          delete props.additional_price;
        }

        /*  KEEP YOUR ORIGINAL PRICE LOGIC */
        const basePrice = (item.original_price || 0) / 100;
        const finalUnitPrice = basePrice + extraPrice;

        /*   LINE LEVEL DISCOUNT (ADDED) */
        const lineDiscountAllocation =
          item.line_level_discount_allocations &&
          item.line_level_discount_allocations.length
            ? item.line_level_discount_allocations[0]
            : null;

        const appliedDiscount = lineDiscountAllocation
          ? mapDiscountApplication(
              lineDiscountAllocation.discount_application
            )
          : null;

        return {
          originalUnitPrice: basePrice,
          variantId: `gid://shopify/ProductVariant/${item.variant_id}`,
          quantity: item.quantity,

          priceOverride: {
            amount: String(finalUnitPrice),
            currencyCode: "PKR"
          },

          /*   ADD DISCOUNT WITHOUT TOUCHING ANYTHING ELSE */
          ...(appliedDiscount && { appliedDiscount }),

          customAttributes: Object.entries(props).map(([key, value]) => ({
            key,
            value
          }))
        };
      })
      .filter(Boolean)
  };
}
// checkout button
function sendDraftOrder(cartData, redirect = false) {
  const payload = buildPayload(cartData);
  console.log("📦 Payload to send:", payload);

  return fetch("https://phpstack-1427592-5716770.cloudwaysapps.com/api/create/draft/order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then(res => res.json())
    .then(apiRes => {
      console.log("  API Response:", apiRes);
      const checkout_url = apiRes.draft_order?.invoiceUrl;

      if (redirect && checkout_url) {
        console.log("  Redirecting to:", checkout_url);
        window.location.href = checkout_url;
      }
    })
    .catch(err => {
      console.error("  Error sending draft order:", err);
      if (redirect) window.location.href = "/checkout"; // fallback
    });
}
document.addEventListener('click', function (evt) {
  const checkoutBtn = evt.target.closest('.cart__checkout-button[name="checkout"]');
  console.log("checkoutbtn",checkoutBtn)
    if (!checkoutBtn) return;

    evt.preventDefault(); // stop default Shopify checkout
    console.log(" Checkout clicked, preparing payload...");

    //   Hide the checkout button
    checkoutBtn.style.display = "none";

    //   Show spinner (make sure .spinner_main exists in DOM)
    const spinner = document.querySelector(".spinner_main");
    if (spinner) {
      spinner.style.display = "flex";
    }
  
    fetch('/cart.js')
      .then(res => res.json())
      .then(cartData => {
      const hasAdditional = cartData.items.some(item => {
        const priceProp = item.properties?.additional_price;
        return priceProp !== undefined && priceProp !== null && priceProp !== '';
      });

      console.log('Has additional price:', hasAdditional);
  if(hasAdditional){
    sendDraftOrder(cartData, true);
  }else {
          console.log("  No additional_price → go to Shopify checkout");
          window.location.href = '/checkout';
        }
    })
      .catch(err => {
        console.error("  Error in checkout API flow:", err);

        //   On error → bring back the button and hide spinner
        checkoutBtn.style.display = "inline-block";
        if (spinner) spinner.style.display = "none";

        window.location.href = "/checkout"; // fallback
      });
});
