document.addEventListener('DOMContentLoaded', () => {

    /**
     * Fungsi bantu generik untuk menangani aksi like (post dan komentar).
     * @param {string} url - Endpoint API untuk like/unlike.
     * @param {HTMLElement} form - Elemen form yang di-submit.
     */

    const handleLike = async (url, form) => {
        try {
            const response = await fetch(url, { method: 'POST' });
            if (!response.ok) throw new Error('Network response was not ok.');
            
            const data = await response.json();

            if (data.success) {
                const id = form.dataset.postid || form.dataset.commentid;
                const button = form.querySelector('button, button strong'); 
                const likesCountElement = document.getElementById(`likes-count-${id}`) 
                    || document.getElementById(`comment-likes-count-${id}`);
                
                const isPostLike = !!form.dataset.postid;
                if (data.liked) {
                    button.textContent = 'Batal Suka';
                    if (isPostLike) {
                        button.classList.remove('btn-outline-danger');
                        button.classList.add('btn-danger');
                    } else {
                        button.classList.remove('text-primary');
                        button.classList.add('text-danger');
                    }
                } else {
                    button.textContent = 'Suka';
                    if (isPostLike) {
                        button.classList.remove('btn-danger');
                        button.classList.add('btn-outline-danger');
                    } else {
                        button.classList.remove('text-danger');
                        button.classList.add('text-primary');
                    }
                }

                if (likesCountElement) {
                    likesCountElement.textContent = `${data.likesCount} Suka`;
                }
            }
        } catch (err) {
            console.error('Gagal melakukan aksi like:', err);
        }
    };

    // ================= EVENT LISTENER UTAMA =================
    document.body.addEventListener('submit', async (e) => {
        if (!e.target.matches('.like-form, .comment-like-form, .comment-form')) return;
        e.preventDefault();

        // Like Post
        if (e.target.matches('.like-form')) {
            const postId = e.target.dataset.postid;
            handleLike(`/posts/${postId}/like`, e.target);
            return;
        }

        // Like Komentar
        if (e.target.matches('.comment-like-form')) {
            const commentId = e.target.dataset.commentid;
            handleLike(`/comments/${commentId}/like`, e.target);
            return;
        }

        // Kirim Komentar / Balasan
        if (e.target.matches('.comment-form')) {
            const form = e.target;
            const postId = form.dataset.postid;
            const parentId = form.dataset.parentid;
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
                    const commentHTML = `
                        <div class="d-flex mb-2" id="comment-${newComment._id}">
                            <img src="/uploads/avatars/${newComment.user.profilePicture}" alt="Avatar" width="30" height="30" class="rounded-circle me-2 mt-1">
                            <div class="bg-white p-2 rounded w-100">
                                <a href="/profile/${newComment.user.username}" class="fw-bold text-dark text-decoration-none small">${newComment.user.username}</a>
                                <p class="mb-0 small">${newComment.content}</p>
                            </div>
                        </div>
                    `;
                    
                    if (parentId) {
                        const parentCommentElement = document.getElementById(`comment-${parentId}`);
                        parentCommentElement.querySelector('.replies-container').insertAdjacentHTML('beforeend', commentHTML);
                    } else {
                        const commentSection = form.closest('.card-footer');
                        commentSection.insertAdjacentHTML('afterbegin', commentHTML);
                    }

                    input.value = '';
                }
            } catch (err) {
                console.error('Gagal mengirim komentar:', err);
            }
        }
    });

    // ================= LOGIKA SOCKET.IO =================
    if (typeof currentUserId !== 'undefined') {
        const socket = io();

        socket.on('connect', () => {
            socket.emit('register', currentUserId);
        });

        // Notifikasi realtime (Toast Bootstrap)
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

        // Update percakapan realtime
        socket.on('conversationUpdated', (updatedConv) => {
            const listGroup = document.querySelector('.list-group');
            if (!listGroup) return;

            const placeholder = listGroup.querySelector('.text-center');
            if (placeholder) placeholder.remove();

            let convElement = document.getElementById(`conv-${updatedConv._id}`);
            const otherParticipant = updatedConv.participants.find(p => p._id.toString() !== currentUserId);
            if (!otherParticipant) return;

            const hasUnread = updatedConv.unreadBy && updatedConv.unreadBy.includes(currentUserId);
            const badgeHTML = hasUnread ? `<span class="badge bg-primary rounded-pill">Baru</span>` : '';
            
            let previewText = "Mulai percakapan...";
            if (updatedConv.lastMessage && updatedConv.lastMessage.text) {
                previewText = updatedConv.lastMessage.text;
            }

            if (convElement) {
                convElement.querySelector('.chat-preview').innerText = previewText;
                convElement.querySelector('.unread-badge').innerHTML = badgeHTML;
            } else {
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
            
            listGroup.insertBefore(convElement, listGroup.firstChild);
        });
    }
});
