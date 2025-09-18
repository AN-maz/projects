document.addEventListener('DOMContentLoaded', () => {
    const likeForms = document.querySelectorAll('.like-form');

    likeForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const postId = form.dataset.postid; // sesuai dengan data-postid di EJS
            console.log("Post ID:", postId); // debug

            try {
                const response = await fetch(`/posts/${postId}/like`, {
                    method: 'POST',
                });

                const data = await response.json();

                if (data.success) {
                    const button = form.querySelector('button');
                    const likesCount = document.getElementById(`likes-count-${postId}`);

                    if (data.liked) {
                        button.textContent = 'Batal Suka';
                        button.classList.remove('btn-outline-primary');
                        button.classList.add('btn-danger');
                    } else {
                        button.textContent = 'Suka';
                        button.classList.remove('btn-danger');
                        button.classList.add('btn-outline-primary');
                    }

                    if (likesCount) {
                        likesCount.textContent = `${data.likesCount} Suka`;
                    }
                }
            } catch (err) {
                console.error('Gagal melakukan like:', err);
            }
        });
    });
});


// --- LIVE NOTIF ---
if (typeof currentUserId !== 'undefined') {
    const socket = io();

    socket.on('connect', () => {
        socket.emit('register', currentUserId);
    });

    const toastElement = document.getElementById('notificationToast');
    const toastTitle = document.getElementById('notificationTitle');
    const toastBody = document.getElementById('notificationBody');
    // Perbaikan: 'bootstrap' (b kecil) adalah objek global dari script Bootstrap
    const notificationToast = toastElement ? new bootstrap.Toast(toastElement) : null;

    socket.on('newNotification', (data) => {
        if (notificationToast) {
            toastTitle.innerText = data.title;
            if (data.link) {
                toastBody.innerHTML = `<a href="${data.link}" class="text-dark text-decoration-none">${data.message}</a>`;
            } else {
                toastBody.innerText = data.message;
            }
            notificationToast.show();
        }
    });
}