// Blog Article Management System

class BlogManager {
  constructor() {
    this.articles = [];
    this.articlesFile = 'data/articles.json';
    this.init();
  }

  async init() {
    await this.loadArticles();
    this.renderPage();
    this.setupShareButtons();
  }

  async loadArticles() {
    try {
      const response = await fetch(this.articlesFile);
      if (!response.ok) throw new Error('Failed to load articles');
      const data = await response.json();
      this.articles = data.articles || [];
      // Sort by date (newest first)
      this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error('Error loading articles:', error);
      this.articles = [];
    }
  }

  renderPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'blog.html' || currentPage === 'blog') {
      this.renderBlogList();
    } else if (currentPage === 'article.html' || currentPage === 'article') {
      this.renderArticle();
    }
  }

  renderBlogList() {
    const grid = document.getElementById('articlesGrid');
    if (!grid) return;

    if (this.articles.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <h2>No articles yet</h2>
          <p>Check back soon for new content!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.articles.map(article => this.createArticleCard(article)).join('');
    
    // Add click handlers
    grid.querySelectorAll('.article-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (!e.target.closest('.read-more-btn')) return;
        e.preventDefault();
        const articleId = card.dataset.articleId;
        window.location.href = `article.html?id=${articleId}`;
      });
    });
  }

  createArticleCard(article) {
    const date = new Date(article.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
      <article class="article-card" data-article-id="${article.id}">
        <img src="${article.featuredImage}" alt="${article.title}" class="article-card-image" loading="lazy">
        <div class="article-card-content">
          <h2 class="article-card-title">${this.escapeHtml(article.title)}</h2>
          <p class="article-card-excerpt">${this.escapeHtml(article.excerpt)}</p>
          <div class="article-card-meta">
            <span>By ${this.escapeHtml(article.author)}</span>
            <span>${date}</span>
          </div>
          <a href="article.html?id=${article.id}" class="read-more-btn">Read More</a>
        </div>
      </article>
    `;
  }

  renderArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    
    if (!articleId) {
      document.body.innerHTML = '<h1>Article not found</h1><a href="blog.html">Back to Blog</a>';
      return;
    }

    const article = this.articles.find(a => a.id === articleId);
    
    if (!article) {
      document.body.innerHTML = '<h1>Article not found</h1><a href="blog.html">Back to Blog</a>';
      return;
    }

    // Update page title
    document.getElementById('articleTitle').textContent = `${article.title} — Electa`;
    
    // Update article content
    document.getElementById('articleHeading').textContent = article.title;
    document.getElementById('articleAuthor').textContent = article.author;
    
    const date = new Date(article.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    document.getElementById('articleDate').textContent = date;
    
    const featuredImg = document.getElementById('articleFeaturedImage');
    featuredImg.innerHTML = `<img src="${article.featuredImage}" alt="${article.title}">`;
    
    const content = document.getElementById('articleContent');
    content.innerHTML = this.formatContent(article.content);
    
    // Update share buttons
    this.updateShareButtons(article);
    
    // Insert ad slots in content if needed
    this.insertAdSlots(content);
  }

  formatContent(content) {
    // Convert markdown-like syntax to HTML
    let html = content;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
    
    // Line breaks
    html = html.replace(/\n\n/gim, '</p><p>');
    html = html.replace(/\n/gim, '<br>');
    
    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/gim, '');
    html = html.replace(/<p><br><\/p>/gim, '');
    
    return html;
  }

  insertAdSlots(contentElement) {
    const paragraphs = contentElement.querySelectorAll('p');
    if (paragraphs.length < 6) return;
    
    // Insert ad after 3rd paragraph
    const middleAd = document.createElement('div');
    middleAd.className = 'ad-slot ad-slot-middle';
    middleAd.setAttribute('data-ad-position', 'middle');
    middleAd.innerHTML = '<div class="ad-placeholder">Advertisement</div>';
    
    const middleIndex = Math.floor(paragraphs.length / 2);
    if (paragraphs[middleIndex]) {
      paragraphs[middleIndex].after(middleAd);
    }
  }

  updateShareButtons(article) {
    const currentUrl = window.location.href;
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedTitle = encodeURIComponent(article.title);
    const encodedText = encodeURIComponent(article.excerpt);

    // Twitter
    const twitterBtn = document.querySelector('.share-twitter');
    if (twitterBtn) {
      twitterBtn.href = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
    }

    // Facebook
    const facebookBtn = document.querySelector('.share-facebook');
    if (facebookBtn) {
      facebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    }

    // LinkedIn
    const linkedinBtn = document.querySelector('.share-linkedin');
    if (linkedinBtn) {
      linkedinBtn.href = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    }

    // Copy link
    const copyBtn = document.querySelector('.share-copy');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentUrl).then(() => {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Copied!';
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
          }, 2000);
        });
      });
    }
  }

  setupShareButtons() {
    // Share buttons are set up in updateShareButtons
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // CMS Methods
  async saveArticle(articleData) {
    // Generate ID if new article
    if (!articleData.id) {
      articleData.id = this.generateId();
      articleData.date = new Date().toISOString();
    }

    // Find existing article or add new
    const index = this.articles.findIndex(a => a.id === articleData.id);
    if (index >= 0) {
      this.articles[index] = articleData;
    } else {
      this.articles.unshift(articleData); // Add to beginning
    }

    // Sort by date
    this.articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Save to JSON (in a real app, this would be a server endpoint)
    await this.saveToFile();
    
    return articleData;
  }

  async saveToFile() {
    // Note: In a browser environment, we can't directly write to files
    // This would typically be handled by a backend API
    // For now, we'll use localStorage as a fallback
    try {
      localStorage.setItem('articles_backup', JSON.stringify({ articles: this.articles }));
      console.log('Articles saved to localStorage (backup)');
      console.log('To save to file, use the CMS interface which will download the JSON');
    } catch (error) {
      console.error('Error saving articles:', error);
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  downloadArticlesJSON() {
    const dataStr = JSON.stringify({ articles: this.articles }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'articles.json';
    link.click();
    URL.revokeObjectURL(url);
  }
}

// Initialize blog manager when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.blogManager = new BlogManager();
  });
} else {
  window.blogManager = new BlogManager();
}

// Export for use in CMS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlogManager;
}

