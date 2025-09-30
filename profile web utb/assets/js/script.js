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

// Table BTN
document.addEventListener("DOMContentLoaded", function () {
    const accordionHeaders = document.querySelectorAll(".accordion-header");

    accordionHeaders.forEach(header => {
        header.addEventListener("click", function() {
            const currentActiveHeader = document.querySelector(".accordion-header.active");

            if (currentActiveHeader && currentActiveHeader !== this) {
                currentActiveHeader.classList.remove("active");
                currentActiveHeader.nextElementSibling.style.maxHeight = null;
            }

            this.classList.toggle("active");
            const accordionContent = this.nextElementSibling;

            if (this.classList.contains('active')) {
                accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
            } else {
                accordionContent.style.maxHeight = null;
            }
        });
    });
})


 var swiper = new Swiper(".mySwiper", {
            // Berapa slide yang terlihat
            slidesPerView: 1, 
            // Jarak antar slide
            spaceBetween: 30,
            // Aktifkan loop tak terbatas
            loop: true,
            // Pengaturan navigasi (panah)
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            // Pengaturan responsive
            breakpoints: {
                // Saat lebar layar 640px atau lebih
                640: {
                    slidesPerView: 2,
                    spaceBetween: 20,
                },
                // Saat lebar layar 1024px atau lebih
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
            },
        });