// Menunggu seluruh halaman dimuat sebelum menjalankan skrip
document.addEventListener('DOMContentLoaded', () => {

    // --- INISIALISASI VARIABEL ---
    const socket = io();
    const messageContainer = document.getElementById('message-container');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const noMessagePlaceholder = document.getElementById('no-message-placeholder');

    // Mengambil data dari atribut HTML
    const convId = messageContainer.dataset.conversationId;
    const currentUserId = messageContainer.dataset.userId;

    // Variabel untuk Modal Edit
    const editMessageModalEl = document.getElementById('editMessageModal');
    const editMessageModal = new bootstrap.Modal(editMessageModalEl);
    const editMessageInput = document.getElementById('editMessageInput');
    const saveEditBtn = document.getElementById('save-edit-btn');
    let messageToEditId = null;

    // --- FUNGSI UTAMA ---

    // Bergabung ke room socket
    if (convId) {
        socket.emit('joinConversation', convId);
    }

    // Auto-scroll ke pesan terakhir
    const scrollToBottom = () => {
        if (messageContainer) {
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    };
    scrollToBottom();

    // Fungsi untuk membuat HTML gelembung pesan secara dinamis
    const createMessageBubbleHTML = (message) => {
        const isMyMessage = message.sender._id.toString() === currentUserId;
        const formattedTime = new Date(message.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        // Membuat dropdown menu HANYA jika itu pesan kita
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
            <div class="d-flex ${isMyMessage ? 'justify-content-end' : 'justify-content-start'} mb-3 message-bubble-wrapper">
                <div class="message-actions ${isMyMessage ? 'order-first me-2' : 'order-last ms-2'} align-self-center">
                    ${actionsMenu}
                </div>
                <div class="${isMyMessage ? 'my-message-bubble' : 'their-message-bubble'} p-2 rounded" style="max-width: 70%;">
                    <div class="message-content">${message.content}</div>
                    ${editedIndicator}
                    <div class="text-end ${isMyMessage ? 'text-light opacity-75' : 'text-muted'}" style="font-size: 0.75rem;">
                        ${formattedTime}
                    </div>
                </div>
            </div>
        `;
    };

    // --- EVENT LISTENERS ---

    // Mengirim pesan baru
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

    // Event listener terpusat untuk Edit & Hapus
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

    // Menyimpan perubahan dari modal edit
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

    // Menerima pesan baru
    socket.on('newMessage', (message) => {
        if (noMessagePlaceholder) noMessagePlaceholder.remove();
        const messageHTML = createMessageBubbleHTML(message);
        messageContainer.insertAdjacentHTML('beforeend', messageHTML);
        scrollToBottom();
    });

    // Menerima event pesan dihapus
    socket.on('messageDeleted', (data) => {
        const messageElement = document.querySelector(`.delete-message-btn[data-messageid="${data.messageId}"]`);
        if (messageElement) {
            messageElement.closest('.message-bubble-wrapper').remove();
        }
    });

    // Menerima event pesan diedit
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
});