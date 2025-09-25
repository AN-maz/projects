document.addEventListener('DOMContentLoaded', () => {

    // --- INISIALISASI VARIABEL ---
    const socket = io();
    const messageContainer = document.getElementById('message-container');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const noMessagePlaceholder = document.getElementById('no-message-placeholder');

    const convId = messageContainer.dataset.conversationId;
    const currentUserId = messageContainer.dataset.userId;

    const editMessageModalEl = document.getElementById('editMessageModal');
    const editMessageModal = new bootstrap.Modal(editMessageModalEl);
    const editMessageInput = document.getElementById('editMessageInput');
    const saveEditBtn = document.getElementById('save-edit-btn');
    let messageToEditId = null;

    // --- FUNGSI UTAMA ---

    if (convId) {
        socket.emit('joinConversation', convId);
        socket.emit('markAsRead', { conversationId: convId, userId: currentUserId });
    }

    const scrollToBottom = () => {
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    };
    scrollToBottom();

    const createMessageBubbleHTML = (message) => {
        const isMyMessage = message.sender._id.toString() === currentUserId;
        const formattedTime = new Date(message.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        const bubbleClass = isMyMessage ? 'my-message-bubble' : 'their-message-bubble';
        const alignmentClass = isMyMessage ? 'justify-content-end' : 'justify-content-start';
        const actionsOrderClass = isMyMessage ? 'order-first me-2' : 'order-last ms-2';
        const timeClass = isMyMessage ? 'text-light opacity-75' : 'text-muted';

        const actionsMenu = isMyMessage ? `
            <div class="dropdown">
                <button class="btn btn-sm btn-light py-0 px-1" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <ul class="dropdown-menu">
                    <li><button class="dropdown-item edit-message-btn" data-messageid="${message._id}">Edit</button></li>
                    <li><button class="dropdown-item text-danger delete-message-btn" data-messageid="${message._id}">Hapus</button></li>
                </ul>
            </div>
        ` : '';

        const editedIndicator = message.isEdited ? `<span class="opacity-75 fst-italic" style="font-size: 0.7rem;">(diedit)</span>` : '';

        return `
            <div class="d-flex ${alignmentClass} mb-3 message-bubble-wrapper">
                <div class="message-actions ${actionsOrderClass} align-self-center">
                    ${actionsMenu}
                </div>
                <div class="${bubbleClass} p-2 rounded" style="max-width: 70%;">
                    <div class="message-content">${message.content}</div>
                    ${editedIndicator}
                    <div class="text-end ${timeClass}" style="font-size: 0.75rem;">
                        ${formattedTime}
                    </div>
                </div>
            </div>
        `;
    };

    // --- EVENT LISTENERS ---

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = messageInput.value.trim();
        if (content && convId) {
            socket.emit('sendMessage', {
                conversationId: convId,
                sender: { _id: currentUserId },
                content: content,
            });
            messageInput.value = '';
        }
    });

    messageContainer.addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-message-btn')) {
            const messageId = e.target.dataset.messageid;
            if (confirm('Anda yakin ingin menghapus pesan ini?')) {
                fetch(`/messages/${messageId}`, { method: 'DELETE' });
            }
        } else if (e.target.classList.contains('edit-message-btn')) {
            messageToEditId = e.target.dataset.messageid;
            const messageWrapper = e.target.closest('.message-bubble-wrapper');
            const currentContent = messageWrapper.querySelector('.message-content').textContent;
            editMessageInput.value = currentContent;
            editMessageModal.show();
        }
    });

    saveEditBtn.addEventListener('click', async () => {
        const newContent = editMessageInput.value.trim();
        if (newContent && messageToEditId) {
            fetch(`/messages/${messageToEditId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent })
            });
            editMessageModal.hide();
        }
    });

    // --- SOCKET LISTENERS ---

    socket.on('newMessage', (message) => {
        if (noMessagePlaceholder) noMessagePlaceholder.remove();

        const messageHTML = createMessageBubbleHTML(message);
        messageContainer.insertAdjacentHTML('beforeend', messageHTML);

        scrollToBottom();
    });

    socket.on('messageDeleted', (data) => {
        const messageElement = document.querySelector(`.delete-message-btn[data-messageid="${data.messageId}"]`);
        if (messageElement) {
            messageElement.closest('.message-bubble-wrapper').remove();
        }
    });

    socket.on('messageEdited', (data) => {
        const messageElement = document.querySelector(`.edit-message-btn[data-messageid="${data.messageId}"]`);
        if (messageElement) {
            const wrapper = messageElement.closest('.message-bubble-wrapper');
            wrapper.querySelector('.message-content').textContent = data.content;

            let editedSpan = wrapper.querySelector('.fst-italic');
            if (!editedSpan) {
                editedSpan = document.createElement('span');
                editedSpan.className = 'opacity-75 fst-italic';
                editedSpan.style.fontSize = '0.7rem';
                editedSpan.textContent = '(diedit)';
                wrapper.querySelector('.message-content').after(editedSpan);
            }
        }
    });

    socket.on('conversationUpdated', (updatedConv) => {
        const listGroup = document.querySelector('.list-group');
        if (!listGroup) return;

        let convElement = document.getElementById(`conv-${updatedConv._id}`);

        const otherParticipant = updatedConv.participants.find(p => p._id.toString() !== currentUserId);
        if (!otherParticipant) return;

        // Logika untuk menentukan apakah badge "Baru" harus ditampilkan
        const hasUnread = updatedConv.unreadBy && updatedConv.unreadBy.includes(currentUserId);
        const badgeHTML = hasUnread ? `<span class="badge bg-primary rounded-pill">Baru</span>` : '';

        // Logika untuk menampilkan preview pesan terakhir
        let previewText = "Mulai percakapan...";
        if (updatedConv.lastMessage && updatedConv.lastMessage.text) {
            const prefix = updatedConv.lastMessage.sender.toString() === currentUserId ? "Anda: " : "";
            previewText = prefix + updatedConv.lastMessage.text;
        }

        if (convElement) {
            // Jika elemen percakapan sudah ada di daftar, cukup perbarui isinya
            convElement.querySelector('.chat-preview').textContent = previewText;
            convElement.querySelector('.unread-badge').innerHTML = badgeHTML;
        } else {
            // Jika ini percakapan baru, buat elemennya dari awal
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

        // Selalu pindahkan percakapan yang baru diupdate ke paling atas
        listGroup.prepend(convElement);
    });

});