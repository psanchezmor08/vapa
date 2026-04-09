import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { blogAPI } from '../services/api';

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    published: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin()) {
      navigate('/login');
      return;
    }
    loadPosts();
  }, [user]);

  const loadPosts = async () => {
    try {
      const data = await blogAPI.getPosts(false); // Get all posts including unpublished
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingPost) {
        await blogAPI.updatePost(editingPost.id, formData);
      } else {
        await blogAPI.createPost(formData);
      }
      
      setFormData({ title: '', content: '', excerpt: '', published: true });
      setShowForm(false);
      setEditingPost(null);
      loadPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Error al guardar el post');
    }
    setLoading(false);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      published: post.published
    });
    setShowForm(true);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('¿Estás seguro de eliminar este post?')) return;
    
    try {
      await blogAPI.deletePost(postId);
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error al eliminar el post');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPost(null);
    setFormData({ title: '', content: '', excerpt: '', published: true });
  };

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-lime-400">Panel de Administración</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded transition"
          >
            {showForm ? 'Ver Posts' : 'Nuevo Post'}
          </button>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
          <div className="mb-4 text-lime-300">
            <p>Bienvenido, <strong>{user.email}</strong></p>
            <p className="text-sm text-gray-400">Rol: {user.role}</p>
          </div>
          
          {showForm ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-2xl font-bold text-lime-400 mb-4">
                {editingPost ? 'Editar Post' : 'Crear Nuevo Post'}
              </h2>
              
              <div>
                <label className="block text-lime-300 mb-2">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
                />
              </div>
              
              <div>
                <label className="block text-lime-300 mb-2">Extracto</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  required
                  rows={2}
                  className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
                />
              </div>
              
              <div>
                <label className="block text-lime-300 mb-2">Contenido (Markdown)</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows={12}
                  className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-lime-400"
                />
              </div>
              
              <div>
                <label className="flex items-center text-lime-300">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="mr-2"
                  />
                  Publicar
                </label>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : editingPost ? 'Actualizar Post' : 'Crear Post'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-lime-400 mb-4">Todos los Posts</h2>
              
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-gray-900/50 border border-lime-500/20 rounded p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-lime-400 mb-1">{post.title}</h3>
                      <p className="text-lime-200 text-sm mb-2">{post.excerpt}</p>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>{new Date(post.created_at).toLocaleDateString('es-ES')}</span>
                        <span className={post.published ? 'text-green-400' : 'text-yellow-400'}>
                          {post.published ? 'Publicado' : 'Borrador'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
