export function initChatHandlers() {

    const chatMessagesContainer = document.getElementById('chat-messages');
    if (!chatMessagesContainer) return; 

    chatMessagesContainer.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-message-btn');
        if (deleteBtn) {
            const messageId = deleteBtn.dataset.messageid;
            
            if (confirm('Anda yakin ingin menghapus pesan ini?')) {
                try {
                    const response = await fetch(`/messages/${messageId}`, {
                        method: 'DELETE'
                    });
                    const data = await response.json();
                    if (!data.success) {
                        alert(data.message || 'Gagal menghapus pesan.');
                    }
                } catch (err) {
                    console.error('Error:', err);
                    alert('Terjadi kesalahan koneksi.');
                }
            }
        }
    });
}