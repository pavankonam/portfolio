'use strict';
const menu = document.querySelector('.menu-toggle');
const links = document.querySelector('#nav-links');
const mobile = window.matchMedia('(max-width: 760px)');
function resetMenu() {
  links.hidden = mobile.matches;
  menu.setAttribute('aria-expanded', 'false');
}
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!expanded));
  links.hidden = expanded;
});
links.addEventListener('click', event => {
  if (event.target.closest('a') && mobile.matches) resetMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobile.matches && !links.hidden) {
    resetMenu();
    menu.focus();
  }
});
mobile.addEventListener('change', resetMenu);
resetMenu();
document.querySelector('#year').textContent = new Date().getFullYear();
