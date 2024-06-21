// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyD87CUWNKl4jrXGpsMAiVupYHkkwlk9ZIo",
    authDomain: "testing-comment.firebaseapp.com",
    databaseURL: "https://testing-comment-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "testing-comment",
    storageBucket: "testing-comment.appspot.com",
    messagingSenderId: "270376816966",
    appId: "1:270376816966:web:5f19b7006d516404181547"
};
firebase.initializeApp(firebaseConfig);



// Function to create a new post
function createPost(university) {
    const postContent = document.getElementById('postContent').value;
    const fileInput = document.getElementById('upload').files[0];
    const postsRef = firebase.database().ref('posts/' + university);
    
    if (fileInput) {
        const storageRef = firebase.storage().ref('uploads/' + fileInput.name);
        storageRef.put(fileInput).then(() => {
            storageRef.getDownloadURL().then((url) => {
                postsRef.push({
                    content: postContent,
                    imageUrl: url,
                    likes: 0,
                    dislikes: 0,
                    comments: []
                });
                displayPosts(university);
            });
        });
    } else {
        postsRef.push({
            content: postContent,
            imageUrl: null,
            likes: 0,
            dislikes: 0,
            comments: []
        });
        displayPosts(university);
    }
}

// Function to display posts
function displayPosts(university) {
    const postsRef = firebase.database().ref('posts/' + university);
    postsRef.on('value', (snapshot) => {
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const post = childSnapshot.val();
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.dataset.postId = post.id;

            postElement.innerHTML = `
                <p>${post.content}</p>
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image">` : ''}
            `;
            addPostActions(postElement, post.id, post.likes, post.dislikes);

            const comments = document.createElement('div');
            comments.className = 'comments';
            postElement.appendChild(comments);

            if (post.comments) {
                for (const commentId in post.comments) {
                    const comment = post.comments[commentId];
                    const commentElement = createCommentElement(comment, post.id, commentId);
                    comments.appendChild(commentElement);
                }
            }

            postsContainer.appendChild(postElement);
        });
    });
}

// Function to add post actions (like, dislike, delete, comment)
function addPostActions(post, postId, initialLikes = 0, initialDislikes = 0) {
    const actions = document.createElement('div');
    actions.className = 'actions';

    const likeButton = document.createElement('button');
    likeButton.className = 'action-button';
    likeButton.innerHTML = `<i class="fas fa-thumbs-up"></i> Like <span class="like-count">${initialLikes}</span>`;
    likeButton.onclick = function() {
        handleLikeDislike(this, postId, true);
    };
    actions.appendChild(likeButton);

    const dislikeButton = document.createElement('button');
    dislikeButton.className = 'action-button';
    dislikeButton.innerHTML = `<i class="fas fa-thumbs-down"></i> Dislike <span class="dislike-count">${initialDislikes}</span>`;
    dislikeButton.onclick = function() {
        handleLikeDislike(this, postId, false);
    };
    actions.appendChild(dislikeButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'action-button';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteButton.onclick = function() {
        deletePostFromDatabase(postId);
        post.remove();
    };
    actions.appendChild(deleteButton);

    post.appendChild(actions);

    const commentInput = document.createElement('div');
    commentInput.className = 'comment-input';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Add a comment...';
    const button = document.createElement('button');
    button.textContent = 'Post';
    button.onclick = function() {
        addComment(input, post.querySelector('.comments'), postId);
    };
    commentInput.appendChild(input);
    commentInput.appendChild(button);
    post.appendChild(commentInput);
}

// Function to handle like and dislike actions
function handleLikeDislike(button, postId, isLike) {
    const countSpan = button.querySelector(isLike ? '.like-count' : '.dislike-count');
    const otherButton = button.nextSibling || button.previousSibling;
    const otherCountSpan = otherButton.querySelector(isLike ? '.dislike-count' : '.like-count');
    const count = parseInt(countSpan.textContent);
    const otherCount = parseInt(otherCountSpan.textContent);
    
    if (button.classList.toggle(isLike ? 'liked' : 'disliked')) {
        countSpan.textContent = count + 1;
        if (otherButton.classList.contains(isLike ? 'disliked' : 'liked')) {
            otherButton.classList.remove(isLike ? 'disliked' : 'liked');
            otherCountSpan.textContent = otherCount - 1;
        }
    } else {
        countSpan.textContent = count - 1;
    }

    firebase.database().ref('posts/' + postId).update({
        [isLike ? 'likes' : 'dislikes']: parseInt(countSpan.textContent)
    });
}

// Function to add a comment
function addComment(input, comments, postId) {
    if (input.value) {
        const comment = {
            text: input.value,
            replies: []
        };

        const commentRef = firebase.database().ref('posts/' + postId + '/comments').push();
        commentRef.set(comment);

        const commentElement = createCommentElement(comment, postId, commentRef.key);
        comments.appendChild(commentElement);
        input.value = '';
    }
}

// Function to create a comment element
function createCommentElement(comment, postId, commentId) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = comment.text;

    const replyButton = document.createElement('button');
    replyButton.className = 'action-button';
    replyButton.innerHTML = 'Reply';
    replyButton.onclick = function() {
        const replyInput = document.createElement('input');
        replyInput.type = 'text';
        replyInput.placeholder = 'Add a reply...';

        const postReplyButton = document.createElement('button');
        postReplyButton.textContent = 'Post';
        postReplyButton.onclick = function() {
            addReply(replyInput, commentElement, postId, commentId);
        };

        commentElement.appendChild(replyInput);
        commentElement.appendChild(postReplyButton);
    };
    commentElement.appendChild(replyButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'action-button';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteButton.onclick = function() {
        deleteCommentFromDatabase(postId, commentId);
        commentElement.remove();
    };
    commentElement.appendChild(deleteButton);

    if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(reply => {
            const replyElement = document.createElement('div');
            replyElement.className = 'reply';
            replyElement.textContent = reply.text;
            commentElement.appendChild(replyElement);
        });
    }

    return commentElement;
}

// Function to add a reply
function addReply(replyInput, commentElement, postId, commentId) {
    if (replyInput.value) {
        const reply = {
            text: replyInput.value
        };

        const replyRef = firebase.database().ref('posts/' + postId + '/comments/' + commentId + '/replies').push();
        replyRef.set(reply);

        const replyElement = document.createElement('div');
        replyElement.className = 'reply';
        replyElement.textContent = replyInput.value;

        commentElement.appendChild(replyElement);
        replyInput.remove();
        replyInput.nextSibling.remove();
    }
}

// Function to delete a post from the database
function deletePostFromDatabase(postId) {
    firebase.database().ref('posts/' + postId).remove();
}

// Function to delete a comment from the database
function deleteCommentFromDatabase(postId, commentId) {
    firebase.database().ref('posts/' + postId + '/comments/' + commentId).remove();
}

// Initialize the page
window.onload = function() {
    const university = document.title.toLowerCase();
    displayPosts(university);
};
