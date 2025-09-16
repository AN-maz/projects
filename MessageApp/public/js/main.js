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
