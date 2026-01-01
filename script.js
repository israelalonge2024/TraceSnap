// State management
let users = JSON.parse(localStorage.getItem("users")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let posts = JSON.parse(localStorage.getItem("posts")) || [];
let currentFilter = "all";
let searchQuery = "";

// Initialize app
function init() {
  if (currentUser) {
    showApp();
    updateStats();
  } else {
    showAuth();
  }
}

// Show loading alert
function showAlert(message, duration = 3000) {
  const alert = document.createElement("div");
  alert.className = "loading-alert";
  alert.textContent = message;
  document.body.appendChild(alert);

  setTimeout(() => {
    alert.style.opacity = "0";
    alert.style.transform = "translateX(-50%) translateY(-20px)";
    setTimeout(() => alert.remove(), 300);
  }, duration);
}

// Update statistics
function updateStats() {
  document.getElementById("statUsers").textContent = users.length;
  document.getElementById("statPosts").textContent = posts.length;
  const totalLikes = posts.reduce((acc, p) => acc + (p.likes?.length || 0), 0);
  document.getElementById("statLikes").textContent = totalLikes;
}

// Theme management
function toggleTheme() {
  document.body.classList.toggle("light-mode");
  const isLight = document.body.classList.contains("light-mode");
  document.getElementById("themeIcon").innerHTML = isLight
    ? '<i class="fas fa-moon"></i>'
    : '<i class="fas fa-sun"></i>';
  localStorage.setItem("theme", isLight ? "light" : "dark");
}

// Load saved theme
if (localStorage.getItem("theme") === "light") {
  document.body.classList.add("light-mode");
  document.getElementById("themeIcon").innerHTML =
    '<i class="fas fa-moon"></i>';
}

// Auth functions
function showAuth() {
  document.getElementById("authContainer").classList.remove("hidden");
  document.getElementById("appContainer").classList.add("hidden");
}

function showApp() {
  document.getElementById("authContainer").classList.add("hidden");
  document.getElementById("appContainer").classList.remove("hidden");
  renderFeed();
}

function handleSignUp() {
  const username = document.getElementById("authUsername").value.trim();
  const password = document.getElementById("authPassword").value;
  const phone = document.getElementById("authPhone").value.trim();

  if (!username || !password) {
    alert("Please fill all required fields");
    return;
  }

  if (users.find((u) => u.username === username)) {
    alert("Username already exists");
    return;
  }

  const newUser = { username, password, phone: phone || null };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  currentUser = newUser;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  document.getElementById("authUsername").value = "";
  document.getElementById("authPassword").value = "";
  document.getElementById("authPhone").value = "";

  showApp();
  updateStats();
  showAlert("✅ Sign up successful! Welcome to TraceSnap");
}

function handleLogin() {
  const username = document.getElementById("authUsername").value.trim();
  const password = document.getElementById("authPassword").value;

  if (!username || !password) {
    alert("Please fill all fields");
    return;
  }

  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) {
    alert("Invalid credentials");
    return;
  }

  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  document.getElementById("authUsername").value = "";
  document.getElementById("authPassword").value = "";
  document.getElementById("authPhone").value = "";

  showApp();
  updateStats();
  showAlert("✅ Welcome back, " + currentUser.username + "!");
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  showAuth();
}

// Profile functions
function toggleProfile() {
  const feedView = document.getElementById("feedView");
  const profileView = document.getElementById("profileView");
  const isShowingProfile = !profileView.classList.contains("hidden");

  if (isShowingProfile) {
    profileView.classList.add("hidden");
    feedView.classList.remove("hidden");
    document.getElementById("profileIcon").innerHTML =
      '<i class="fas fa-user"></i>';
  } else {
    feedView.classList.add("hidden");
    profileView.classList.remove("hidden");
    document.getElementById("profileIcon").innerHTML =
      '<i class="fas fa-house"></i>';
    renderProfile();
  }
}

function renderProfile() {
  document.getElementById("profileAvatar").textContent =
    currentUser.username[0].toUpperCase();
  document.getElementById("profileUsername").textContent = currentUser.username;
  document.getElementById("profileHandle").textContent =
    "@" + currentUser.username;

  const userPosts = posts.filter((p) => p.username === currentUser.username);
  const totalLikes = userPosts.reduce(
    (acc, p) => acc + (p.likes?.length || 0),
    0
  );

  document.getElementById("postCount").textContent = userPosts.length;
  document.getElementById("likeCount").textContent = totalLikes;

  const userPostsDiv = document.getElementById("userPosts");
  if (userPosts.length === 0) {
    userPostsDiv.innerHTML =
      '<div class="empty-state">You haven\'t posted anything yet</div>';
  } else {
    userPostsDiv.innerHTML = "";
    userPosts.forEach((post) => {
      userPostsDiv.appendChild(createPostElement(post));
    });
  }
}

// Post modal functions
function openPostModal() {
  if (!currentUser) {
    alert("Please log in to create a post");
    return;
  }
  document.getElementById("postModal").classList.remove("hidden");
}

function closePostModal() {
  document.getElementById("postModal").classList.add("hidden");
  document.getElementById("postStatus").value = "";
  document.getElementById("postItem").value = "";
  document.getElementById("postDescription").value = "";
  document.getElementById("postLocation").value = "";
  document.getElementById("postPhone").value = "";
  document.getElementById("postImage").value = "";
}

function handleCreatePost() {
  const status = document.getElementById("postStatus").value;
  const item = document.getElementById("postItem").value;
  const description = document.getElementById("postDescription").value;
  const location = document.getElementById("postLocation").value;
  const phone = document.getElementById("postPhone").value.trim();
  const imageFile = document.getElementById("postImage").files[0];

  if (!status || !item || !description || !location) {
    alert("Please fill all required fields");
    return;
  }

  showAlert("📤 Creating your post...", 2000);

  if (imageFile) {
    const reader = new FileReader();
    reader.onload = function () {
      const newPost = {
        id: Date.now(),
        username: currentUser.username,
        description,
        status,
        item,
        location,
        phone: phone || null,
        image: reader.result,
        likes: [],
        comments: [],
        timestamp: new Date().toISOString(),
      };

      posts.unshift(newPost);
      localStorage.setItem("posts", JSON.stringify(posts));
      renderFeed();
      updateStats();
      closePostModal();

      setTimeout(() => {
        showAlert("✅ Post created successfully!");
      }, 2000);
    };
    reader.readAsDataURL(imageFile);
  } else {
    const newPost = {
      id: Date.now(),
      username: currentUser.username,
      description,
      status,
      item,
      location,
      phone: phone || null,
      likes: [],
      comments: [],
      timestamp: new Date().toISOString(),
    };

    posts.unshift(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));
    renderFeed();
    updateStats();
    closePostModal();

    setTimeout(() => {
      showAlert("✅ Post created successfully!");
    }, 2000);
  }
}
// Filter and search functions
function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.dataset.filter === filter) {
      btn.classList.add("active");
    }
  });
  renderFeed();
}

function handleSearch() {
  searchQuery = document.getElementById("searchInput").value.toLowerCase();
  renderFeed();
}

function getFilteredPosts() {
  let filtered = posts;

  if (currentFilter !== "all") {
    filtered = filtered.filter((p) => p.status === currentFilter);
  }

  if (searchQuery) {
    filtered = filtered.filter(
      (p) =>
        p.description.toLowerCase().includes(searchQuery) ||
        p.item.toLowerCase().includes(searchQuery) ||
        p.location.toLowerCase().includes(searchQuery)
    );
  }

  return filtered;
}

// Render functions
function renderFeed() {
  const feed = document.getElementById("feed");
  const filtered = getFilteredPosts();

  if (filtered.length === 0) {
    feed.innerHTML = '<div class="empty-state">No posts found</div>';
    return;
  }

  feed.innerHTML = "";
  filtered.forEach((post) => {
    feed.appendChild(createPostElement(post));
  });
}

function createPostElement(post) {
  const postDiv = document.createElement("div");
  postDiv.className = "post";

  const hasLiked = post.likes?.includes(currentUser?.username);
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;

  const contactInfo = post.phone
    ? `
        <div class="contact-info">
          <i style="color:#1D9BF0" class="fas fa-phone"></i> Contact: <a href="tel:${post.phone}">${post.phone}</a>
        </div>
      `
    : "";

  postDiv.innerHTML = `
        <div class="post-header">
          <div class="avatar">${post.username[0].toUpperCase()}</div>
          <div class="post-content">
            <div class="post-meta">
              <span class="username">${post.username}</span>
              <span class="handle">@${post.username}</span>
              <span class="handle">·</span>
              <span class="handle">${new Date(
                post.timestamp
              ).toLocaleDateString()}</span>
            </div>
            <div class="post-badge badge-${post.status}">
              ${post.status.toUpperCase()} - ${post.item}
            </div>
            <p class="post-text">${post.description}</p>
            <p class="post-location"><i style="color:#F4212E" class="fas fa-map-marker-alt"></i> ${
              post.location
            }</p>
            ${contactInfo}
            <img src="${post.image}" alt="Post image" class="post-image" />
            <div class="post-actions">
              <button class="like-btn ${
                hasLiked ? "liked" : ""
              }" onclick="handleLike(${post.id})">
                ${
                  hasLiked
                    ? '<i style="color:#F91880" class="fas fa-heart"></i>'
                    : '<i style="color:#71767B;" class="far fa-heart"></i>'
                }
                <span>${likeCount}</span>
              </button>
              ${
                likeCount > 0
                  ? `<span class="likers-text">Liked by ${post.likes
                      .slice(0, 2)
                      .join(", ")}${
                      likeCount > 2 ? ` and ${likeCount - 2} others` : ""
                    }</span>`
                  : ""
              }
            </div>
            
            <div class="comment-section">
              ${
                commentCount > 0
                  ? `<div class="comment-count"><i class="far fa-comment"></i> ${commentCount} ${
                      commentCount === 1 ? "comment" : "comments"
                    }</div>`
                  : ""
              }
              
              <div class="comment-input-wrapper">
                <input 
                  type="text" 
                  class="comment-input" 
                  placeholder="Add a comment..." 
                  onkeypress="handleCommentKeyPress(event, ${post.id})"
                  id="comment-input-${post.id}"
                />
                <button class="comment-btn" onclick="handleComment(${post.id})">
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
              
              <div class="comment-list">
                ${
                  post.comments && post.comments.length > 0
                    ? post.comments
                        .map(
                          (c) => `
                    <div style="display:flex; gap:10px; padding-bottom:8px;"
                     class="comment">
                    <b>${c.user}:</b> ${c.text}
                    </div>
                  `
                        )
                        .join("")
                    : '<div class="no-comments">No comments yet. Be the first to comment!</div>'
                }
              </div>
            </div>
          </div>
        </div>
      `;

  return postDiv;
}

function handleLike(postId) {
  if (!currentUser) {
    alert("Please log in to like posts");
    return;
  }

  posts = posts.map((post) => {
    if (post.id === postId) {
      const likes = post.likes || [];
      const hasLiked = likes.includes(currentUser.username);

      return {
        ...post,
        likes: hasLiked
          ? likes.filter((u) => u !== currentUser.username)
          : [...likes, currentUser.username],
      };
    }
    return post;
  });

  localStorage.setItem("posts", JSON.stringify(posts));
  renderFeed();
  updateStats();

  // Update profile if showing
  if (!document.getElementById("profileView").classList.contains("hidden")) {
    renderProfile();
  }
}

// Comment functions
function handleCommentKeyPress(event, postId) {
  if (event.key === "Enter") {
    handleComment(postId);
  }
}

function handleComment(postId) {
  if (!currentUser) {
    alert("Please log in to comment");
    return;
  }

  const input = document.getElementById(`comment-input-${postId}`);
  const text = input.value.trim();

  if (!text) {
    alert("Please enter a comment");
    return;
  }

  posts = posts.map((post) => {
    if (post.id === postId) {
      const comments = post.comments || [];
      return {
        ...post,
        comments: [
          ...comments,
          {
            user: currentUser.username,
            text: text,
            timestamp: new Date().toISOString(),
          },
        ],
      };
    }
    return post;
  });

  localStorage.setItem("posts", JSON.stringify(posts));
  renderFeed();
  updateStats();

  // Update profile if showing
  if (!document.getElementById("profileView").classList.contains("hidden")) {
    renderProfile();
  }

  showAlert("✅ Comment added!", 2000);
}

// Initialize app on load
init();

/*
function makePost() {
  const usertext = document.getElementById("userText").value.trim();
  const image = document.getElementById("image").files[0];

  if (!usertext && !image) {
    alert("Post cannot be empty");
    return;
  }

  if (image) {
    const reader = new FileReader();
    reader.onload = function () {
      createPost(usertext, reader.result);
    };
    reader.readAsDataURL(image);
  } else {
    createPost(usertext, null);
  }

  cancelModal();
  alert("post already made😎");

  document.getElementById("userText").value = "";
  document.getElementById("image").value = "";
}

function createPost(usertext, image) {
  const feeds = [
    document.getElementById("feed"),
    document.getElementById("feeds"),
  ];

  feeds.forEach((feed) => {
    if (!feed) return;

    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <div class="post-head" style="display:flex; gap:20px; align-items:center;">
        <div id="mobile-name" class="mobile-version-nav-img" style="
          width:40px;
          height:40px;
          border-radius:50%;
          background-color:rgb(22,157,235);
          display:flex;
          align-items:center;
          justify-content:center;
          color:#fff;
          font-weight:bold;
        ">
          ${currentUser.username[0].toUpperCase()}
        </div>
        <p style="font-weight:700; font-size:20px;">
          ${currentUser.username}
        </p>
      </div>

      <p class="post-text" style="padding-left:50px;  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;">
        ${usertext}
      </p>

      ${image ? `<img src="${image}" />` : ""}
    `;

    feed.prepend(div);
  });
}
 */
