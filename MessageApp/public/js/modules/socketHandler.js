function appendComment(comment) {
    if (!comment || !comment.user) return;

    let tagHtml = '';
    if (comment.replyingTo && comment.replyingTo.username) {
        tagHtml = `<a href="/profile/${comment.replyingTo.username}" class="text-primary text-decoration-none fw-bold me-1">@${comment.replyingTo.username}</a>`;
    }

    // Hanya tampilkan tombol hapus jika komentar ini milik user yang sedang login
    let deleteButtonHtml = '';
    if (typeof currentUserId !== 'undefined' && comment.user._id.toString() === currentUserId.toString()) {
        deleteButtonHtml = `
            <small class="text-muted mx-2">·</small>
            <button class="btn btn-link btn-sm text-danger text-decoration-none p-0 delete-comment-btn" data-commentid="${comment._id}">
                <strong class="text-danger">Hapus</strong>
            </button>
        `;
    }

    const commentHTML = `
        <div class="comment-wrapper mb-2" id="comment-wrapper-${comment._id}">
            <div class="d-flex" id="comment-${comment._id}">
                <img src="/uploads/avatars/${comment.user.profilePicture}" alt="Avatar" width="30" height="30" class="rounded-circle me-2 mt-1">
                <div class="bg-light p-2 rounded w-100">
                    <a href="/profile/${comment.user.username}" class="fw-bold text-dark text-decoration-none small">${comment.user.username}</a>
                    <p class="mb-1 small">${tagHtml} ${comment.content}</p>
                    <div class="d-flex align-items-center mt-1">
                        <a href="#" class="btn btn-link btn-sm text-decoration-none p-0 reply-btn" data-commentid="${comment._id}">
                            <strong class="text-muted">Balas</strong>
                        </a>
                        ${deleteButtonHtml}
                    </div>
                </div>
            </div>
            <div class="ms-5 d-none reply-form-container" id="reply-form-${comment._id}">
                </div>
        </div>
    `;

    // Logika untuk menempatkan komentar/balasan di tempat yang benar
    if (comment.parentComment) {
        const parentCommentWrapper = document.getElementById(`comment-wrapper-${comment.parentComment}`);
        if (parentCommentWrapper) {
            let repliesContainer = parentCommentWrapper.querySelector('.replies-container');
            // Jika kontainer balasan belum ada, buat dulu
            if (!repliesContainer) {
                repliesContainer = document.createElement('div');
                repliesContainer.className = 'replies-container ms-4 ps-3 border-start';
                parentCommentWrapper.appendChild(repliesContainer);
            }
            repliesContainer.insertAdjacentHTML('beforeend', commentHTML);
        }
    } else {
        const postCard = document.querySelector(`.post-card[data-postid="${comment.post}"]`);
        if (postCard) {
            const commentSection = postCard.querySelector('.new-comments-container');
            commentSection.insertAdjacentHTML('beforeend', commentHTML);
        }
    }
}
export function initSocketHandlers() {
    if (typeof currentUserId === 'undefined') return;

    const socket = io();

    socket.on('connect', () => socket.emit('register', currentUserId));

    socket.on('messageDeleted', (data) => {
        const messageWrapper = document.getElementById(`message-wrapper-${data.messageId}`);
        if (messageWrapper) {
            messageWrapper.remove();
        }
    });

    socket.on('newComment', (newCommentData) => {
        appendComment(newCommentData);
    });

    const toastElement = document.getElementById('notificationToast');
    if (toastElement) {
        const toastTitle = document.getElementById('notificationTitle');
        const toastBody = document.getElementById('notificationBody');
        const notificationToast = new bootstrap.Toast(toastElement);
        socket.on('newNotification', (data) => {
            toastTitle.innerText = data.title;
            toastBody.innerHTML = `<a href="${data.link}" class="text-dark text-decoration-none">${data.message}</a>`;
            notificationToast.show();
        });
    }

    socket.on('conversationUpdated', (updatedConv) => {
        const listGroup = document.querySelector('.list-group');
        if (!listGroup) return;

        let convElement = document.getElementById(`conv-${updatedConv._id}`);
        const otherParticipant = updatedConv.participants.find(p => p._id.toString() !== currentUserId);
        if (!otherParticipant) return;
        
        const hasUnread = updatedConv.unreadBy && updatedConv.unreadBy.includes(currentUserId);
        const badgeHTML = hasUnread ? `<span class="badge bg-primary rounded-pill">Baru</span>` : '';
        
        let previewText = "Mulai percakapan...";
        if (updatedConv.lastMessage && updatedConv.lastMessage.content) {
            const prefix = updatedConv.lastMessage.sender.toString() === currentUserId ? "Anda: " : "";
            previewText = prefix + updatedConv.lastMessage.content;
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
        listGroup.prepend(convElement);
    });
}