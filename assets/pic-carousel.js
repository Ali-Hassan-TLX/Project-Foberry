class PicCarousel {
  constructor(wrapper) {
    this.wrapper   = wrapper;
    this.track     = wrapper.querySelector('.pic-track');
    this.dotsWrap  = wrapper.querySelector('.pic-dots');

    if (!this.track) return;

    this.totalReal      = wrapper.querySelectorAll('.pic-slide:not(.is-clone)').length;
    this.currentIndex   = 0;
    this.startX         = 0;
    this.startTranslate = 0;
    this.isDragging     = false;
    this.isTransitioning = false;

    this.init();
  }

  getSlides() {
    return this.track.querySelectorAll('.pic-slide');
  }

  getSlideWidth() {
    const slides = this.getSlides();
    return slides[0]
      ? slides[0].getBoundingClientRect().width
      : this.wrapper.offsetWidth * 0.8;
  }

  getOffset(index) {
    const sw          = this.getSlideWidth();
    const ww          = this.wrapper.offsetWidth;
    const peekOffset  = ww * 0.1;
    return -((index + 1) * sw) + peekOffset;
  }

  setTranslate(x, animate) {
    this.track.style.transition = animate
      ? 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none';
    this.track.style.transform = `translateX(${x}px)`;
  }

  updateDots(index) {
    if (!this.dotsWrap) return;
    const dots = this.dotsWrap.querySelectorAll('.pic-dot');
    dots.forEach((dot, i) => {
      const active = i === index;
      dot.classList.toggle('is-active', active);
      dot.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  updateSlideStyles(index) {
    const slides = this.getSlides();
    slides.forEach(slide => slide.classList.remove('is-active'));
    if (slides[index + 1]) slides[index + 1].classList.add('is-active');
  }

  goTo(index, animate = true) {
    this.currentIndex = index;
    this.setTranslate(this.getOffset(this.currentIndex), animate);
    this.updateDots(
      ((this.currentIndex % this.totalReal) + this.totalReal) % this.totalReal
    );
    this.updateSlideStyles(this.currentIndex);
  }

  handleTransitionEnd() {
    if (this.currentIndex === -1) {
      this.goTo(this.totalReal - 1, false);
    } else if (this.currentIndex === this.totalReal) {
      this.goTo(0, false);
    }
    this.isTransitioning = false;
  }

  onTouchStart(e) {
    this.startX         = e.touches[0].clientX;
    this.startTranslate = this.getOffset(this.currentIndex);
    this.isDragging     = true;
    this.track.classList.add('is-dragging');
  }

  onTouchMove(e) {
    if (!this.isDragging) return;
    const diff = e.touches[0].clientX - this.startX;
    this.track.style.transition = 'none';
    this.track.style.transform  = `translateX(${this.startTranslate + diff}px)`;
  }

  onTouchEnd(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.classList.remove('is-dragging');
    const diff      = e.changedTouches[0].clientX - this.startX;
    const threshold = this.getSlideWidth() * 0.2;
    if      (diff < -threshold) this.goTo(this.currentIndex + 1, true);
    else if (diff >  threshold) this.goTo(this.currentIndex - 1, true);
    else                        this.goTo(this.currentIndex,     true);
  }

  onMouseDown(e) {
    this.startX         = e.clientX;
    this.startTranslate = this.getOffset(this.currentIndex);
    this.isDragging     = true;
    this.track.classList.add('is-dragging');
    e.preventDefault();
  }

  onMouseMove(e) {
    if (!this.isDragging) return;
    const diff = e.clientX - this.startX;
    this.track.style.transition = 'none';
    this.track.style.transform  = `translateX(${this.startTranslate + diff}px)`;
  }

  onMouseUp(e) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.classList.remove('is-dragging');
    const diff      = e.clientX - this.startX;
    const threshold = this.getSlideWidth() * 0.2;
    if      (diff < -threshold) this.goTo(this.currentIndex + 1, true);
    else if (diff >  threshold) this.goTo(this.currentIndex - 1, true);
    else                        this.goTo(this.currentIndex,     true);
  }

  init() {
    this.goTo(0, false);

    this.track.addEventListener('transitionend', () => this.handleTransitionEnd());

    // Dots
    if (this.dotsWrap) {
      this.dotsWrap.querySelectorAll('.pic-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          this.goTo(parseInt(dot.getAttribute('data-dot'), 10), true);
        });
      });
    }

    // Touch
    this.track.addEventListener('touchstart', e => this.onTouchStart(e), { passive: true });
    this.track.addEventListener('touchmove',  e => this.onTouchMove(e),  { passive: true });
    this.track.addEventListener('touchend',   e => this.onTouchEnd(e));

    // Mouse
    this.track.addEventListener('mousedown', e => this.onMouseDown(e));
    window.addEventListener('mousemove',     e => this.onMouseMove(e));
    window.addEventListener('mouseup',       e => this.onMouseUp(e));

    // Resize
    window.addEventListener('resize', () => this.goTo(this.currentIndex, false));
  }
}


/* ─────────────────────────────────────────────
   Auto-init: page load + any AJAX / Quick View
───────────────────────────────────────────── */

function initAllCarousels(root = document) {
  root.querySelectorAll('.pic-carousel-wrapper').forEach(wrapper => {
    // Skip if already initialised
    if (wrapper._picCarousel) return;
    wrapper._picCarousel = new PicCarousel(wrapper);
  });
}

// Normal page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initAllCarousels());
} else {
  initAllCarousels();
}

// ── Quick View / AJAX support ──────────────────
// Works with MutationObserver — jab bhi naya
// .pic-carousel-wrapper DOM mein aaye, auto init ho.
const _picObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType !== 1) return;

      // Agar node khud carousel wrapper hai
      if (node.classList && node.classList.contains('pic-carousel-wrapper')) {
        if (!node._picCarousel) node._picCarousel = new PicCarousel(node);
      }

      // Agar node ke andar carousels hain
      node.querySelectorAll && initAllCarousels(node);
    });
  });
});

_picObserver.observe(document.body, { childList: true, subtree: true });