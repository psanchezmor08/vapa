import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPost();
  }, [slug]);

  const loadPost = async () => {
    try {
      // Get all posts to find the one with matching slug
      const posts = await blogAPI.getPosts(true);
      const foundPost = posts.find(p => p.slug === slug);
      
      if (foundPost) {
        // Try to get full post details
        try {
          const fullPost = await blogAPI.getPost(foundPost.id);
          setPost(fullPost);
        } catch {
          // If individual fetch fails, use the post from list
          setPost(foundPost);
        }
      } else {
        console.error('Post not found with slug:', slug);
        navigate('/blog');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      navigate('/blog');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lime-400 text-xl">Cargando post...</div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/blog')}
            className="text-lime-400 hover:text-lime-300 mb-6 transition"
          >
            ← Volver al Blog
          </button>
          
          <article className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-8">
            <h1 className="text-4xl font-bold text-lime-400 mb-4">{post.title}</h1>
            
            <div className="text-sm text-gray-400 mb-8">
              Publicado el {new Date(post.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            
            <div className="prose prose-invert prose-lime max-w-none">
              <ReactMarkdown className="text-lime-100 leading-relaxed">
                {post.content}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
