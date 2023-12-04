const postList = document.getElementById('post-list');

async function getPosts() {
    const response = await fetch('/posts');
    const posts = await response.json();
    postList.innerHTML = '';
    for (const post of posts) {
        const li = document.createElement('li');
        const h3 = document.createElement('h3');
        const p = document.createElement('p');
        const img = document.createElement('img');
        const span = document.createElement('span');
        h3.textContent = post.title;
        p.textContent = post.description;
        img.src = post.image;
        span.textContent = `Skriven av ${post.author.username}`;
        li.appendChild(h3);
        li.appendChild(p);
        li.appendChild(img);
        li.appendChild(span);
        postList.appendChild(li);
    }
}

getPosts();
