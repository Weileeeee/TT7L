function createPost() {
    const upload = document.getElementById('upload');
    if (upload.files && upload.files[0]) {
        const postContainer = document.getElementById('posts');
        const file = upload.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const post = document.createElement('div');
            post.className = 'post';
            
            const img = document.createElement('img');
            img.src = e.target.result;
            post.appendChild(img);
            
            const actions = document.createElement('div');
            actions.className = 'actions';
            
            const likeButton = document.createElement('button');
            likeButton.className = 'action-button';
            likeButton.innerHTML = '<i class="fas fa-thumbs-up"></i> Like <span class="like-count">0</span>';
            likeButton.onclick = function() {
                const likeCount = this.querySelector('.like-count');
                const dislikeButton = this.nextSibling;
                if (this.classList.toggle('liked')) {
                    likeCount.textContent = parseInt(likeCount.textContent) + 1;
                    if (dislikeButton.classList.contains('disliked')) {
                        const dislikeCount = dislikeButton.querySelector('.dislike-count');
                        dislikeButton.classList.remove('disliked');
                        dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
                    }
                } else {
                    likeCount.textContent = parseInt(likeCount.textContent) - 1;
                }
            };
            actions.appendChild(likeButton);

            const dislikeButton = document.createElement('button');
            dislikeButton.className = 'action-button';
            dislikeButton.innerHTML = '<i class="fas fa-thumbs-down"></i> Dislike <span class="dislike-count">0</span>';
            dislikeButton.onclick = function() {
                const dislikeCount = this.querySelector('.dislike-count');
                const likeButton = this.previousSibling;
                if (this.classList.toggle('disliked')) {
                    dislikeCount.textContent = parseInt(dislikeCount.textContent) + 1;
                    if (likeButton.classList.contains('liked')) {
                        const likeCount = likeButton.querySelector('.like-count');
                        likeButton.classList.remove('liked');
                        likeCount.textContent = parseInt(likeCount.textContent) - 1;
                    }
                } else {
                    dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
                }
            };
            actions.appendChild(dislikeButton);
            
            post.appendChild(actions);
            
            const comments = document.createElement('div');
            comments.className = 'comments';
            post.appendChild(comments);
            
            const commentInput = document.createElement('div');
            commentInput.className = 'comment-input';
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Add a comment...';
            const button = document.createElement('button');
            button.textContent = 'Post';
            button.onclick = function() {
                if (input.value) {
                    const comment = document.createElement('div');
                    comment.className = 'comment';
                    comment.innerHTML = input.value + '<button onclick="replyToComment(this)">Reply</button>';
                    comments.appendChild(comment);
                    input.value = '';
                }
            };
            commentInput.appendChild(input);
            commentInput.appendChild(button);
            post.appendChild(commentInput);
            
            postContainer.insertBefore(post, postContainer.firstChild);
        };
        reader.readAsDataURL(file);
    }
}

function replyToComment(button) {
    const comment = button.parentElement;
    const replyInput = document.createElement('div');
    replyInput.className = 'comment-input reply';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Add a reply...';
    const replyButton = document.createElement('button');
    replyButton.textContent = 'Reply';
    replyButton.onclick = function() {
        if (input.value) {
            const reply = document.createElement('div');
            reply.className = 'reply';
            reply.innerHTML = input.value + '<button onclick="replyToComment(this)">Reply</button>';
            comment.appendChild(reply);
            replyInput.remove();
        }
    };
    replyInput.appendChild(input);
    replyInput.appendChild(replyButton);
    comment.appendChild(replyInput);
}
