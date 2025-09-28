document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('.nav-list a');

    function removeActive() {
        navLinks.forEach(link => {
            link.classList.remove('active')
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            removeActive();
            this.classList.add('active');
        });
    });
});

// NAV SCROLL
window.addEventListener('scroll', function () {
    const nav = this.document.querySelector('nav');
    if (window.scrollY > 550) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// HAMBURGER
const burger = document.querySelector('.hamburger-menu');
const navList = document.querySelector('.nav-list');

burger.addEventListener('click', () => {
  navList.classList.toggle('active');
});
