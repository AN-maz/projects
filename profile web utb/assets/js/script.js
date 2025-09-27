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