import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blog';

export function BlogPage() {
  return (
    <div className="page-header container">
      <p className="section-label">Writing</p>
      <h1>Blog</h1>
      <p>Notes on projects, coursework, and things I am learning along the way.</p>

      <div className="blog-list" style={{ marginTop: '2rem' }}>
        {blogPosts.map((post) => (
          <article key={post.slug} className="card blog-card">
            <div className="blog-meta">
              <time>{post.date}</time>
              {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
            </div>
            <h2><Link to={`/blog/${post.slug}`}>{post.title}</Link></h2>
            <p>{post.excerpt}</p>
            <Link to={`/blog/${post.slug}`} className="read-more">Read more →</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
