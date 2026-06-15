// ===================================== Recently Items Js =================================
document.addEventListener('DOMContentLoaded', function(){
class RecentlyViewedProducts extends HTMLElement {
  async connectedCallback() {
    await this.displayRecentlyViewedProducts();
  }

  async displayRecentlyViewedProducts() {
    const sectionID = this.dataset.sectionId
    let recentlyViewed =
      JSON.parse(localStorage.getItem("recentlyViewedProducts")) || [];
    recentlyViewed = recentlyViewed.reverse();

    const productHandles = recentlyViewed.map((product) => product.handle);

    if (!productHandles.length) {
      this.innerHTML = "<p>No recently viewed products.</p>";
      return;
    }

    const url = `${window.location.href}?setion_id=${sectionID}&products=${productHandles.join(",")}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch product data");

      const htmlString = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");

      const recentlyItemsList = doc.querySelector('.recently_items_list');
      if (recentlyItemsList) {
        this.innerHTML = recentlyItemsList.innerHTML;
      } else {
        this.innerHTML = "<p>No recently viewed products found.</p>";
      }

      let recently_items_count = document.querySelectorAll("[recently-items-count]");
      let Count = recentlyViewed.length;
      recently_items_count?.forEach((count) => {
        count.setAttribute("recently-items-count", Count);
      });

    } catch (error) {
      console.error("Error:", error);
      this.innerHTML = "<p>Error loading recently viewed products.</p>";
    }
  }
}

customElements.define("recently-viewed", RecentlyViewedProducts);
});