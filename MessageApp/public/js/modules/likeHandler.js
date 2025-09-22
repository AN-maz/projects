async function handleLike(url, form) {
    try {
        const response = await fetch(url, { method: 'POST' });
        if (!response.ok) throw new Error('Network response was not ok.');
        
        const data = await response.json();

        if (data.success) {
            const id = form.dataset.postid;
            const button = form.querySelector('button');
            const likesCountElement = document.getElementById(`likes-count-${id}`);
            
            if (data.liked) {
                button.textContent = 'Batal Suka';
                button.classList.remove('btn-outline-danger');
                button.classList.add('btn-danger');
            } else {
                button.textContent = 'Suka';
                button.classList.remove('btn-danger');
                button.classList.add('btn-outline-danger');
            }

            if (likesCountElement) {
                likesCountElement.textContent = `${data.likesCount} Suka`;
            }
        }
    } catch (err) {
        console.error('Gagal melakukan aksi like:', err);
    }
}

export function initLikeHandlers() {
    document.body.addEventListener('submit', (e) => {
        if (e.target.matches('.like-form')) {
            e.preventDefault();
            const postId = e.target.dataset.postid;
            handleLike(`/posts/${postId}/like`, e.target);
        }
    });
}