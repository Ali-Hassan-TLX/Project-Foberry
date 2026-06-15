// variants info pop up
document.addEventListener('click', function (e) {
  const wrapper = e.target.closest('.variant-option');
  const header_remove = document.querySelector('.header');
  // open
  if (e.target.closest('.variant-info-icon')) {
    wrapper.querySelector('.variant-info-popup').classList.add('active');
    document.body.classList.add("overflow_hidden");
    header_remove.classList.add("hidden");
  }
  
  // close button
  if (e.target.closest('.close-info-icon')) {
    wrapper.querySelector('.variant-info-popup').classList.remove('active');
    document.body.classList.remove("overflow_hidden");
    header_remove.classList.remove("hidden");
  }
  
  // click on overlay (outside content)
  if (
    e.target.classList.contains('variant-info-popup')
  ) {
    e.target.classList.remove('active');
    header_remove.classList.remove("hidden");
    document.body.classList.remove("overflow_hidden");
  }
});