import { Link, useParams } from 'react-router-dom';
import { getBlogPost } from '../data/blog';

export function BlogPostPage() {
  const { slug } = useParams();
  const post = slug ? getBlogPost(slug) : undefined;

  if (!post) {
    return (
      <div className="page-header container">
        <h1>Post not found</h1>
        <Link to="/blog">← Back to blog</Link>
      </div>
    );
  }

  return (
    <article className="page-header container blog-article">
      <Link to="/blog" className="back-link">← Back to blog</Link>
      <div className="blog-meta">
        <time>{post.date}</time>
        {post.tags.map((t) => <span key={t} className="tag">{t}</span>)}
      </div>
      <h1>{post.title}</h1>
      {post.content.map((para, i) => <p key={i}>{para}</p>)}
    </article>
  );
}
