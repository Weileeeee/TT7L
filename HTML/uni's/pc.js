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

function createPost(university) {
    const postContent = document.getElementById('postContent').value;
    const file = document.getElementById('upload').files[0];
    const userInfo = JSON.parse(sessionStorage.getItem("user-info"));

    if (postContent || file) {
        const newPostRef = firebase.database().ref('posts/' + university).push();

        if (file) {
            const storageRef = firebase.storage().ref('postImages/' + newPostRef.key + '/' + file.name);
            const uploadTask = storageRef.put(file);

            uploadTask.on('state_changed', null, (error) => {
                console.error('Upload failed:', error);
            }, () => {
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                    newPostRef.set({
                        content: postContent,
                        imageUrl: downloadURL,
                        firstname: userInfo.firstname,
                        lastname: userInfo.lastname,
                        likes: 0,
                        dislikes: 0
                    });
                });
            });
        } else {
            newPostRef.set({
                content: postContent,
                firstname: userInfo.firstname,
                lastname: userInfo.lastname,
                likes: 0,
                dislikes: 0
            });
        }
    }
}

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

function addPostActions(postElement, postId, likes, dislikes, university) {
    const actions = document.createElement('div');
    actions.className = 'post-actions';

    actions.innerHTML = `
        <button onclick="likePost('${postId}', true, '${university}')">Like (<span class="likes">${likes}</span>)</button>
        <button onclick="likePost('${postId}', false, '${university}')">Dislike (<span class="dislikes">${dislikes}</span>)</button>
        <button onclick="deletePostFromDatabase('${postId}', '${university}')"><i class="fas fa-trash"></i></button>
        <div class="comment-section">
            <input type="text" class="comment-input" placeholder="Add a comment">
            <button onclick="addComment(this.previousElementSibling, this.nextElementSibling, '${postId}', '${university}')">Comment</button>
            <div class="comments-container"></div>
        </div>
    `;
    postElement.appendChild(actions);
}

function likePost(postId, isLike, university) {
    const postRef = firebase.database().ref('posts/' + university + '/' + postId);
    postRef.once('value').then((snapshot) => {
        const post = snapshot.val();
        let count = isLike ? post.likes : post.dislikes;
        const countSpan = document.querySelector(`[data-post-id="${postId}"] .${isLike ? 'likes' : 'dislikes'}`);
        
        if (isLike) {
            count++;
        } else {
            count--;
        }

        const updates = {};
        updates['/posts/' + university + '/' + postId + '/' + (isLike ? 'likes' : 'dislikes')] = count;
        firebase.database().ref().update(updates);

        countSpan.textContent = count;
    });
}

function deletePostFromDatabase(postId, university) {
    const postRef = firebase.database().ref('posts/' + university + '/' + postId);
    postRef.remove().then(() => {
        console.log('Post deleted successfully');
    }).catch((error) => {
        console.error('Error deleting post:', error);
    });
}

function addComment(input, commentsContainer, postId, university) {
    const commentText = input.value.trim();
    const userInfo = JSON.parse(sessionStorage.getItem("user-info"));

    if (commentText) {
        const newCommentRef = firebase.database().ref('posts/' + university + '/' + postId + '/comments').push();
        newCommentRef.set({
            content: commentText,
            firstname: userInfo.firstname,
            lastname: userInfo.lastname
        }).then(() => {
            const commentElement = createCommentElement({
                content: commentText,
                firstname: userInfo.firstname,
                lastname: userInfo.lastname
            }, postId, newCommentRef.key, university);
            commentsContainer.appendChild(commentElement);
            input.value = '';
        });
    }
}

function createCommentElement(comment, postId, commentId, university) {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.dataset.commentId = commentId;

    commentElement.innerHTML = `
        <p><strong>${comment.firstname} ${comment.lastname}</strong>: ${comment.content}</p>
        <button class="delete-comment" onclick="deleteComment('${postId}', '${commentId}', this, '${university}')"><i class="fas fa-trash"></i></button>
    `;

    return commentElement;
}

function deleteComment(postId, commentId, button, university) {
    const commentRef = firebase.database().ref('posts/' + university + '/' + postId + '/comments/' + commentId);
    commentRef.remove().then(() => {
        button.closest('.comment').remove();
    }).catch((error) => {
        console.error('Error deleting comment:', error);
    });
}
