document.addEventListener('DOMContentLoaded', () => {

    // ================= LIKE/UNLIKE POSTINGAN =================
    const likeForms = document.querySelectorAll('.like-form');
    likeForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const postId = form.dataset.postid;
            try {
                const response = await fetch(`/posts/${postId}/like`, { method: 'POST' });
                const data = await response.json();
                if (data.success) {
                    const button = form.querySelector('button');
                    const likesCount = document.getElementById(`likes-count-${postId}`);
                    if (data.liked) {
                        button.textContent = 'Batal Suka';
                        button.classList.remove('btn-outline-danger');
                        button.classList.add('btn-danger');
                    } else {
                        button.textContent = 'Suka';
                        button.classList.remove('btn-danger');
                        button.classList.add('btn-outline-danger');
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

    // ================= LIKE/UNLIKE KOMENTAR =================
    document.body.addEventListener('submit', async (e) => {
        if (e.target.matches('.comment-like-form')) {
            e.preventDefault();
            const form = e.target;
            const commentId = form.dataset.commentid;

            try {
                const response = await fetch(`/comments/${commentId}/like`, { method: 'POST' });
                const data = await response.json();

                if (data.success) {
                    const button = form.querySelector('button strong');
                    const likesCount = document.getElementById(`comment-likes-count-${commentId}`);

                    if (data.liked) {
                        button.textContent = 'Batal Suka';
                        button.classList.remove('text-primary');
                        button.classList.add('text-danger');
                    } else {
                        button.textContent = 'Suka';
                        button.classList.remove('text-danger');
                        button.classList.add('text-primary');
                    }
                    if (likesCount) {
                        likesCount.textContent = `${data.likesCount} Suka`;
                    }
                }
            } catch (err) {
                console.error('Gagal like komentar:', err);
            }
        }
    });

    // ================= LOGIKA UNTUK NOTIFIKASI REAL-TIME =================
    if (typeof currentUserId !== 'undefined') {
        const socket = io();

        socket.on('connect', () => {
            socket.emit('register', currentUserId);
        });

        // Toast Bootstrap untuk notifikasi
        const toastElement = document.getElementById('notificationToast');
        const toastTitle = document.getElementById('notificationTitle');
        const toastBody = document.getElementById('notificationBody');
        const notificationToast = toastElement ? new bootstrap.Toast(toastElement) : null;

        socket.on('newNotification', (data) => {
            if (notificationToast) {
                toastTitle.innerText = data.title;
                toastBody.innerHTML = `<a href="${data.link}" class="text-dark text-decoration-none">${data.message}</a>`;
                notificationToast.show();
            }
        });

        // ================= UPDATE LIST CONVERSATION REAL-TIME =================
        socket.on('conversationUpdated', (updatedConv) => {
            const listGroup = document.querySelector('.list-group');
            if (!listGroup) return;

            // Hapus placeholder "Belum ada percakapan" jika ada
            const placeholder = listGroup.querySelector('.text-center');
            if (placeholder) placeholder.remove();

            let convElement = document.getElementById(`conv-${updatedConv._id}`);
            
            // Tentukan siapa lawan bicara
            const otherParticipant = updatedConv.participants.find(p => p._id.toString() !== currentUserId);
            if (!otherParticipant) return;

            // Tentukan status "Baru"
            const hasUnread = updatedConv.unreadBy && updatedConv.unreadBy.includes(currentUserId);
            const badgeHTML = hasUnread ? `<span class="badge bg-primary rounded-pill">Baru</span>` : '';
            
            // Tentukan teks pratinjau
            let previewText = "Mulai percakapan...";
            if (updatedConv.lastMessage && updatedConv.lastMessage.text) {
                previewText = updatedConv.lastMessage.text;
            }

            if (convElement) {
                // JIKA ELEMEN SUDAH ADA: Perbarui isinya
                convElement.querySelector('.chat-preview').innerText = previewText;
                convElement.querySelector('.unread-badge').innerHTML = badgeHTML;
            } else {
                // JIKA ELEMEN BELUM ADA: Buat elemen baru
                convElement = document.createElement('a');
                convElement.href = `/messages/${otherParticipant.username}`;
                convElement.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
                convElement.id = `conv-${updatedConv._id}`;
                convElement.innerHTML = `
                    <div class="d-flex align-items-center" style="min-width: 0;">
                        <img src="/uploads/avatars/${otherParticipant.profilePicture}" alt="Avatar" width="40" height="40" class="rounded-circle me-3">
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${otherParticipant.username}</h6>
                            <p class="mb-1 small text-muted chat-preview">${previewText}</p>
                        </div>
                    </div>
                    <span class="unread-badge">${badgeHTML}</span>
                `;
            }
            
            // Pindahkan elemen (yang sudah ada atau yang baru dibuat) ke paling atas
            listGroup.insertBefore(convElement, listGroup.firstChild);
        });
    }
});
