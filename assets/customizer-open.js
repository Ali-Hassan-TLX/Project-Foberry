document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("fullscreen-modal");
  const closeBtn = document.getElementById("close-modal");
  const customizer = document.querySelector(".modal-content .customizer");
  const overview_list = document.querySelector(".overview-list");
  const announcement_bar = document.querySelector(".announcement-bar");
  const headerElement = document.querySelector(".header");
  const header_component = document.querySelector("header-component");
  const headerElementmobile = document.querySelector(".halo-header-mobile");
  const header_sticky = document.querySelector(".header-sticky");
    //  GLOBAL MODAL ADJUST FUNCTION
  window.adjustModal = function adjustModal() {
    if (!modal) return;
    let activeHeader = headerElement;
    if (!activeHeader || activeHeader.offsetHeight === 0) {
      activeHeader = headerElementmobile;
    }
    if (!activeHeader) return;
    activeHeader.classList.remove("has_sticky", "is_sidebar");
    headerElement?.classList.add("view_increase");
     if (header_component) {
      header_component.removeAttribute("transparent");
    }
    modal.style.display = "flex";
    if (customizer) customizer.style.display = "flex";
    window.scrollTo(0, 0);
    document.body.classList.add("overflow_hidden");
    announcement_bar.classList.add("hidden--mobile");
    if (overview_list) {
      setTimeout(() => {
        overview_list.classList.add("openchilds");
      }, 200);
    }
    const headerHeight =
      (activeHeader?.offsetHeight || 0) +
      (announcement_bar?.offsetHeight || 0);
    modal.style.top = headerHeight + "px";
    modal.style.height = `calc(100% - ${headerHeight}px)`;
  };
    //  OPEN MODAL (MULTIPLE BUTTONS)
  document.addEventListener("click", function (e) {
    const openBtn = e.target.closest(".open-modal");
    if (openBtn) {
      setTimeout(() => {
        window.adjustModal();
      }, 50);
    }
  });
    //  CLOSE MODAL
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      setTimeout(() => {
        modal.style.display = "none";
        modal.style.height = "0";
        document.body.classList.remove("overflow_hidden");
        document.body.classList.remove("overflow_mobile");
        announcement_bar.classList.remove("hidden--mobile");
        headerElement?.classList.remove("view_increase");
        if (header_component) {
          header_component.setAttribute("transparent", "not-sticky");
        }
      }, 200);
    });
  }
    //  RESIZE & SCROLL FIX
  ["scroll", "resize"].forEach((evt) => {
    window.addEventListener(evt, () => {
      if (modal && modal.style.display === "flex") {
        window.adjustModal();
      }
    });
  });
});
// additional options
if (document.querySelector('.card-stack')) {
  document.querySelector('.card-stack').addEventListener('click', function () {
    const contrastOptions = document.querySelectorAll('.overview-list.style-list .contrast-options');
    const makeSelections = document.querySelectorAll('.card-stack-text');
    const optionCard = this.querySelector('.option-card'); 
    const second = this.querySelector('.second'); 
    const thrid = this.querySelector('.thrid'); 
    const scrollParent = this.closest(".overview-list")
    if (contrastOptions.length <= 3 || !makeSelections.length) return;
    const delayPerItem = 0;
    // State based on 4th element (first 3 always visible)
    const isShowing = contrastOptions[3].classList.contains('hidden'); 
    if (isShowing) {
      // SHOW
      contrastOptions.forEach((el, index) => {
        if (index < 3) {
          // first 3 → only toggle "show", never hidden
          setTimeout(() => {
            el.classList.add('show');
          }, index * delayPerItem);
        } else {
          setTimeout(() => {
            el.classList.remove('hidden');
            el.classList.add('show');
          }, (index - 3) * delayPerItem + 3 * delayPerItem);
        }
      });
    } else {
      // HIDE
      contrastOptions.forEach((el, index) => {
        if (index < 3) {
          // first 3 → only remove "show", never hidden
          setTimeout(() => {
            el.classList.remove('show');
          }, index * (delayPerItem / 2));
        } else {
          setTimeout(() => {
            el.classList.remove('show');
            el.classList.add('hidden');
          }, (index - 3) * (delayPerItem / 2));
        }
      });
    }
    // Toggle button state
    this.classList.toggle('active', isShowing);
    makeSelections[0].textContent = isShowing ? 'HIDE' : 'SHOW MORE';
   if (window.innerWidth < 450 && optionCard) {
      if (second) second.style.display = isShowing ? 'none' : 'block';
      if (thrid) thrid.style.display = isShowing ? 'none' : 'block';
            if (scrollParent) {
    if (isShowing) {
      // scroll to bottom after small delay (optional)
      setTimeout(() => {
        scrollParent.scrollTo({
          top: scrollParent.scrollHeight,
          behavior: 'smooth'
        });
      }, 500); // <-- delay in milliseconds
    }
  }
      optionCard.style.width = isShowing ? '100%' : '80%';
      optionCard.style.transition = 'width 0.3s ease';
    }
    makeSelections.forEach(el => {
      el.style.background = isShowing
        ? '#4eb74e'
        : 'linear-gradient(0deg,rgba(112, 112, 112, 1) 0%, rgba(20, 21, 22, 1) 40%)';
    });
  });
}