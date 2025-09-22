export function initCommentHandlers() {

    // Menangani klik untuk "Balas", "Lihat Balasan", dan "Hapus Komentar"
    document.body.addEventListener('click', async (e) => {
        const replyBtn = e.target.closest('.reply-btn');
        const viewRepliesBtn = e.target.closest('.view-replies-btn');
        const deleteCommentBtn = e.target.closest('.delete-comment-btn');

        // Toggle form balasan
        if (replyBtn) {
            e.preventDefault();
            const commentId = replyBtn.dataset.commentid;
            const replyFormContainer = document.getElementById(`reply-form-${commentId}`);
            if (replyFormContainer) {
                replyFormContainer.classList.toggle('d-none');
            }
        }

        // Toggle lihat/sembunyikan balasan
        if (viewRepliesBtn) {
            e.preventDefault();
            const repliesList = viewRepliesBtn.nextElementSibling;
            if (repliesList) {
                repliesList.classList.toggle('d-none');
                const isHidden = repliesList.classList.contains('d-none');
                viewRepliesBtn.textContent = isHidden
                    ? viewRepliesBtn.textContent.replace('Sembunyikan', 'Lihat')
                    : viewRepliesBtn.textContent.replace('Lihat', 'Sembunyikan');
            }
        }
        
        // Hapus komentar
        if (deleteCommentBtn) {
            e.preventDefault();
            const commentId = deleteCommentBtn.dataset.commentid;
            if (confirm('Yakin ingin menghapus komentar ini?')) {
                try {
                    const response = await fetch(`/comments/${commentId}`, { method: 'DELETE' });
                    const data = await response.json();
                    if (data.success) {
                        const commentWrapper = document.getElementById(`comment-wrapper-${commentId}`);
                        if (commentWrapper) commentWrapper.remove();
                    } else {
                        alert(data.message || 'Gagal menghapus komentar.');
                    }
                } catch (err) {
                    console.error('Error saat menghapus komentar:', err);
                }
            }
        }
    });

    // Menangani submit form komentar/balasan
    document.body.addEventListener('submit', async (e) => {
        if (!e.target.matches('.comment-form')) return;
        e.preventDefault();

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
                body: JSON.stringify({ content: content, parentCommentId: parentId })
            });
            const data = await response.json();
            if (data.success) {
                input.value = '';
                if (parentId) {
                    form.closest('.reply-form-container').classList.add('d-none');
                }
            }
        } catch (err) {
            console.error('Gagal mengirim komentar:', err);
        }
    });
}