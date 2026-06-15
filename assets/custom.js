// Add to Cart - Flying Image Animation
// Paste this as a new <script> tag in your theme, or in the existing component JS

(function() {
  function flyImageToCart(imageUrl, triggerElement) {
    const cartBubble = document.querySelector('.cart-bubble') || document.querySelector('[ref="cartBubble"]');
    const cartButton = document.querySelector('.header-actions__action');
    
    if (!cartBubble && !cartButton) return;
    
    const target = cartBubble || cartButton;
    const targetRect = target.getBoundingClientRect();
    const triggerRect = triggerElement.getBoundingClientRect();
    
    // Create flying circle
    const flyImg = document.createElement('div');
    flyImg.style.cssText = `
      position: fixed;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      z-index: 99999;
      pointer-events: none;
      top: ${triggerRect.top + triggerRect.height / 2 - 24}px;
      left: ${triggerRect.left + triggerRect.width / 2 - 24}px;
      transition: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    `;
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
    flyImg.appendChild(img);
    document.body.appendChild(flyImg);
    
    // Force reflow
    flyImg.getBoundingClientRect();
    
    const targetX = targetRect.left + targetRect.width / 2 - 24;
    const targetY = targetRect.top + targetRect.height / 2 - 24;
    
    flyImg.style.cssText += `
      transition: top 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  left 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                  width 0.65s ease,
                  height 0.65s ease,
                  opacity 0.15s ease 0.5s;
    `;
    
    requestAnimationFrame(() => {
      flyImg.style.top = targetY + 'px';
      flyImg.style.left = targetX + 'px';
      flyImg.style.width = '24px';
      flyImg.style.height = '24px';
      flyImg.style.opacity = '0';
    });
    
    setTimeout(() => {
      flyImg.remove();
    }, 800);
  }

  // Hook into add-to-cart clicks
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('[ref="addToCartButton"], .add-to-cart-button, #BuyButtons-ProductSubmitButton-ASHpDN01jT3ZXb3EzN__add-to-cart');
    if (!btn) return;
    
    const component = btn.closest('add-to-cart-component');
    if (!component) return;
    
    const imageUrl = component.getAttribute('data-product-variant-media');
    if (!imageUrl) return;
    
    flyImageToCart(imageUrl, btn);
  }, true);
})();
// card gallery js
document.querySelectorAll(".card-gallery").forEach((card) => {
  const dots = card.querySelectorAll(".pagi_dot");
  const slides = card.querySelectorAll("slideshow-slide");

  // DOT CLICK (already working)
  dots.forEach((dot) => {
    dot.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const targetId = this.getAttribute("data-id");

      slides.forEach((slide) => {
        if (slide.getAttribute("slide-id") === targetId) {
          slide.scrollIntoView({ behavior: "smooth", inline: "center" });
        }
      });
    });
  });

  // 👇 OBSERVER for scroll/swipe detection
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const activeId = entry.target.getAttribute("slide-id");

          // Update dots
          dots.forEach((dot) => {
            dot.classList.toggle(
              "active",
              dot.getAttribute("data-id") === activeId
            );
          });
        }
      });
    },
    {
      root: card.querySelector("slideshow-slides"),
      threshold: 0.6, // 60% visible = active
    }
  );

  slides.forEach((slide) => observer.observe(slide));

  // Default active
  if (dots.length) {
    dots[0].classList.add("active");
  }
});