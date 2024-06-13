document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('comment-form');
    const commentInput = document.getElementById('comment-input');
    const commentsContainer = document.getElementById('comments-container');

    commentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const commentText = commentInput.value.trim();
        if (commentText) {
            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');

            const commentTextElement = document.createElement('p');
            commentTextElement.textContent = commentText;
            commentElement.appendChild(commentTextElement);

            const likeButton = document.createElement('button');
            likeButton.innerHTML = '<i class="fas fa-thumbs-up"></i> Like';
            likeButton.classList.add('like');

            const dislikeButton = document.createElement('button');
            dislikeButton.innerHTML = '<i class="fas fa-thumbs-down"></i> Dislike';
            dislikeButton.classList.add('dislike');

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
            deleteButton.classList.add('delete');

            const likeCount = document.createElement('span');
            likeCount.classList.add('like-count');
            likeCount.textContent = '0';

            const dislikeCount = document.createElement('span');
            dislikeCount.classList.add('dislike-count');
            dislikeCount.textContent = '0';

            let hasLiked = false;
            let hasDisliked = false;
            let likeTimeout;
            let dislikeTimeout;
            const DOUBLE_CLICK_DELAY = 500; // Extended to 500ms delay for double click

            likeButton.addEventListener('click', () => {
                if (likeTimeout) {
                    clearTimeout(likeTimeout);
                    likeTimeout = null;
                    if (hasLiked) {
                        likeCount.textContent = parseInt(likeCount.textContent) - 1;
                        hasLiked = false;
                        updateButtonStates();
                    }
                } else {
                    likeTimeout = setTimeout(() => {
                        likeTimeout = null;
                        if (!hasLiked && !hasDisliked) {
                            likeCount.textContent = parseInt(likeCount.textContent) + 1;
                            hasLiked = true;
                            updateButtonStates();
                        }
                    }, DOUBLE_CLICK_DELAY);
                }
            });

            dislikeButton.addEventListener('click', () => {
                if (dislikeTimeout) {
                    clearTimeout(dislikeTimeout);
                    dislikeTimeout = null;
                    if (hasDisliked) {
                        dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
                        hasDisliked = false;
                        updateButtonStates();
                    }
                } else {
                    dislikeTimeout = setTimeout(() => {
                        dislikeTimeout = null;
                        if (!hasLiked && !hasDisliked) {
                            dislikeCount.textContent = parseInt(dislikeCount.textContent) + 1;
                            hasDisliked = true;
                            updateButtonStates();
                        }
                    }, DOUBLE_CLICK_DELAY);
                }
            });

            deleteButton.addEventListener('click', () => {
                commentElement.remove();
            });

            function updateButtonStates() {
                likeButton.disabled = hasLiked || hasDisliked;
                dislikeButton.disabled = hasLiked || hasDisliked;
                if (!hasLiked && !hasDisliked) {
                    likeButton.disabled = false;
                    dislikeButton.disabled = false;
                }
            }

            const buttonsContainer = document.createElement('div');
            buttonsContainer.classList.add('comment-buttons');
            buttonsContainer.appendChild(likeButton);
            buttonsContainer.appendChild(likeCount);
            buttonsContainer.appendChild(dislikeButton);
            buttonsContainer.appendChild(dislikeCount);
            buttonsContainer.appendChild(deleteButton);

            commentElement.appendChild(buttonsContainer);
            commentsContainer.appendChild(commentElement);

            commentInput.value = '';
        }
    });
});