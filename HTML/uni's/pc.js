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
    const file = document.getElementById('upload').files[0];
    const userInfo = JSON.parse(sessionStorage.getItem("user-info"));

    if (postContent || file) {
        const newPostRef = firebase.database().ref('posts/' + university).push();

        if (file) {
            const storageRef = firebase.storage().ref('postImages/' + newPostRef.key + '/' + file.name);
            const uploadTask = storageRef.put(file);

            uploadTask.on('state_changed', null, null, () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    newPostRef.set({
                        content: postContent,
                        imageUrl: downloadURL,
                        firstname: userInfo.firstname,
                        lastname: userInfo.lastname,
                        likes: 0,
                        dislikes: 0,
                        comments: []
                    });
                });
            });
        } else {
            newPostRef.set({
                content: postContent,
                firstname: userInfo.firstname,
                lastname: userInfo.lastname,
                likes: 0,
                dislikes: 0,
                comments: []
            });
        }
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
            postElement.dataset.postId = childSnapshot.key;

            postElement.innerHTML = `
                <p><strong>${post.firstname} ${post.lastname}</strong>: ${post.content}</p>
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post image">` : ''}
            `;
            addPostActions(postElement, childSnapshot.key, post.likes, post.dislikes, university);

            const comments = document.createElement('div');
            comments.className = 'comments';
            postElement.appendChild(comments);

            if (post.comments) {
                for (const commentId in post.comments) {
                    const comment = post.comments[commentId];
                    const commentElement = createCommentElement(comment, childSnapshot.key, commentId, university);
                    comments.appendChild(commentElement);
                }
            }

            postsContainer.appendChild(postElement);
        });
    });
}

// Function to add post actions (like, dislike, delete, comment)
function addPostActions(postElement, postId, likes, dislikes, university) {
    const likeButton = document.createElement('button');
    likeButton.className = 'action-button';
    likeButton.innerHTML = `Like <span class="like-count">${likes}</span>`;
    likeButton.onclick = function() {
        handleLikeDislike(likeButton, postId, true, university);
    };

    const dislikeButton = document.createElement('button');
    dislikeButton.className = 'action-button';
    dislikeButton.innerHTML = `Dislike <span class="dislike-count">${dislikes}</span>`;
    dislikeButton.onclick = function() {
        handleLikeDislike(dislikeButton, postId, false, university);
    };

    postElement.appendChild(likeButton);
    postElement.appendChild(dislikeButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'action-button';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteButton.onclick = function() {
        deletePostFromDatabase(postId, university);
        postElement.remove();
    };
    postElement.appendChild(deleteButton);

    const commentInput = document.createElement('div');
    commentInput.className = 'comment-input';
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Add a comment...';
    const button = document.createElement('button');
    button.textContent = 'Post';
    button.onclick = function() {
        addComment(input, postElement.querySelector('.comments'), postId, university);
    };
    commentInput.appendChild(input);
    commentInput.appendChild(button);
    postElement.appendChild(commentInput);
}

// Function to handle like and dislike actions
function handleLikeDislike(button, postId, isLike, university) {
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

    const updates = {
        [isLike ? 'likes' : 'dislikes']: parseInt(countSpan.textContent)
    };
    if (otherButton.classList.contains(isLike ? 'disliked' : 'liked')) {
        updates[isLike ? 'dislikes' : 'likes'] = parseInt(otherCountSpan.textContent);
    }

    firebase.database().ref('posts/' + university + '/' + postId).update(updates);
}

// Function to add a comment
function addComment(input, comments, postId, university) {
    if (input.value) {
        const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
        const comment = {
            text: input.value,
            firstname: userInfo.firstname,
            lastname: userInfo.lastname,
            replies: []
        };

        const commentRef = firebase.database().ref('posts/' + university + '/' + postId + '/comments').push();
        commentRef.set(comment);

        const commentElement = createCommentElement(comment, postId, commentRef.key, university);
        comments.appendChild(commentElement);
        input.value = '';
    }
}

// Function to create a comment element
function createCommentElement(comment, postId, commentId, university) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `<strong>${comment.firstname} ${comment.lastname}</strong>: ${comment.text}`;

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
            addReply(replyInput, commentElement, postId, commentId, university);
        };

        commentElement.appendChild(replyInput);
        commentElement.appendChild(postReplyButton);
    };
    commentElement.appendChild(replyButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'action-button';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Delete';
    deleteButton.onclick = function() {
        deleteCommentFromDatabase(postId, commentId, university);
        commentElement.remove();
    };
    commentElement.appendChild(deleteButton);

    if (comment.replies) {
        for (const replyId in comment.replies) {
            const reply = comment.replies[replyId];
            const replyElement = document.createElement('div');
            replyElement.className = 'reply';
            replyElement.textContent = `${reply.firstname} ${reply.lastname}: ${reply.text}`;
            commentElement.appendChild(replyElement);
        }
    }

    return commentElement;
}

// Function to add a reply
function addReply(replyInput, commentElement, postId, commentId, university) {
    if (replyInput.value) {
        const userInfo = JSON.parse(sessionStorage.getItem("user-info"));
        const reply = {
            text: replyInput.value,
            firstname: userInfo.firstname,
            lastname: userInfo.lastname
        };

        const replyRef = firebase.database().ref('posts/' + university + '/' + postId + '/comments/' + commentId + '/replies').push();
        replyRef.set(reply);

        const replyElement = document.createElement('div');
        replyElement.className = 'reply';
        replyElement.textContent = `${reply.firstname} ${reply.lastname}: ${reply.text}`;
        commentElement.appendChild(replyElement);
        replyInput.remove();
    }
}

// Function to delete a post from the database
function deletePostFromDatabase(postId, university) {
    firebase.database().ref('posts/' + university + '/' + postId).remove();
}

// Function to delete a comment from the database
function deleteCommentFromDatabase(postId, commentId, university) {
    firebase.database().ref('posts/' + university + '/' + postId + '/comments/' + commentId).remove();
}

// Function to initialize post display on page load
window.onload = function() {
    displayPosts('sunway');
};
