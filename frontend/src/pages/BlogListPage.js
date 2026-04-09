import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogAPI } from '../services/api';

const BlogListPage = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [searchTerm, posts]);

  const loadPosts = async () => {
    try {
      const data = await blogAPI.getPosts(true);
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lime-400 text-xl">Cargando posts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-lime-400 mb-8 text-center">Blog IT</h1>
        
        {/* Search Bar */}
        <div className="max-w-4xl mx-auto mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Buscar artículos..."
              className="w-full bg-gray-800/50 border border-lime-500/30 rounded-lg px-4 py-3 pl-12 text-white focus:outline-none focus:border-lime-400 transition"
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-lime-400 text-xl">
              🔍
            </span>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-lime-300 text-sm mt-2">
              {filteredPosts.length} resultado{filteredPosts.length !== 1 ? 's' : ''} encontrado{filteredPosts.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="block bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6 hover:border-lime-400 transition group"
              >
                <h2 className="text-2xl font-bold text-lime-400 mb-2 group-hover:text-lime-300 transition">
                  {post.title}
                </h2>
                <p className="text-lime-200 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>{new Date(post.created_at).toLocaleDateString('es-ES')}</span>
                  <span className="text-lime-400 group-hover:text-lime-300 transition">LEER MÁS →</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-lime-300 text-xl mb-2">No se encontraron artículos</p>
              <p className="text-gray-400">Intenta con otros términos de búsqueda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogListPage;
