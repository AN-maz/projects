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

    // TAMBAHKAN BLOK BARU INI UNTUK MENGIRIM KOMENTAR
    document.body.addEventListener('submit', async (e) => {
        if (e.target.matches('.comment-form')) {
            e.preventDefault();
            const form = e.target;
            const postId = form.dataset.postid;
            const parentId = form.dataset.parentid; // Akan 'undefined' jika ini komentar utama
            const input = form.querySelector('input[name="content"]');
            const content = input.value.trim();

            if (!content) return;

            try {
                const response = await fetch(`/posts/${postId}/comments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        content: content,
                        parentCommentId: parentId
                    })
                });
                
                const data = await response.json();

                if (data.success) {
                    const newComment = data.comment;
                    // Buat HTML untuk komentar baru
                    const commentHTML = `
                        <div class="d-flex mb-2">
                            <img src="/uploads/avatars/${newComment.user.profilePicture}" alt="Avatar" width="30" height="30" class="rounded-circle me-2 mt-1">
                            <div class="bg-white p-2 rounded w-100">
                                <a href="/profile/${newComment.user.username}" class="fw-bold text-dark text-decoration-none small">${newComment.user.username}</a>
                                <p class="mb-0 small">${newComment.content}</p>
                            </div>
                        </div>
                    `;
                    
                    // Tentukan di mana komentar baru akan ditampilkan
                    if (parentId) {
                        // Jika ini balasan, tambahkan di bawah komentar induk
                        const parentCommentElement = document.getElementById(`comment-${parentId}`);
                        parentCommentElement.querySelector('.replies-container').insertAdjacentHTML('beforeend', commentHTML);
                    } else {
                        // Jika komentar utama, tambahkan di atas form
                        const commentSection = form.closest('.card-footer');
                        commentSection.insertAdjacentHTML('afterbegin', commentHTML);
                    }

                    input.value = ''; // Kosongkan input
                }
            } catch (err) {
                console.error('Gagal mengirim komentar:', err);
            }
        }
    });
});
