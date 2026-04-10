import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { blogAPI, usersAPI } from '../services/api';

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', excerpt: '', published: true });
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'viewer' });
  const [resetPasswords, setResetPasswords] = useState({});
  const [myPassword, setMyPassword] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || !isAdmin()) { navigate('/login'); return; }
    loadPosts();
    loadUsers();
  }, [user]);

  const loadPosts = async () => {
    try { const data = await blogAPI.getPosts(false); setPosts(data); }
    catch (error) { console.error('Error loading posts:', error); }
  };

  const loadUsers = async () => {
    try { const data = await usersAPI.getUsers(); setUsers(data); }
    catch (error) { console.error('Error loading users:', error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingPost) { await blogAPI.updatePost(editingPost.id, formData); }
      else { await blogAPI.createPost(formData); }
      setFormData({ title: '', content: '', excerpt: '', published: true });
      setShowForm(false); setEditingPost(null); loadPosts();
    } catch (error) { alert('Error al guardar el post'); }
    setLoading(false);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({ title: post.title, content: post.content, excerpt: post.excerpt, published: post.published });
    setShowForm(true);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('¿Estás seguro de eliminar este post?')) return;
    try { await blogAPI.deletePost(postId); loadPosts(); }
    catch (error) { alert('Error al eliminar el post'); }
  };

  const handleCancel = () => {
    setShowForm(false); setEditingPost(null);
    setFormData({ title: '', content: '', excerpt: '', published: true });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await usersAPI.createUser(newUser.email, newUser.password, newUser.role);
      setNewUser({ email: '', password: '', role: 'viewer' });
      setMessage('Usuario creado correctamente');
      loadUsers();
    } catch (error) { setMessage('Error al crear el usuario'); }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try { await usersAPI.deleteUser(userId); loadUsers(); }
    catch (error) { alert('Error al eliminar el usuario'); }
  };

  const handleResetPassword = async (userId) => {
    const newPass = resetPasswords[userId];
    if (!newPass || newPass.length < 6) { alert('La contraseña debe tener al menos 6 caracteres'); return; }
    try {
      await usersAPI.resetPassword(userId, newPass);
      setResetPasswords({ ...resetPasswords, [userId]: '' });
      setMessage('Contraseña restablecida correctamente');
    } catch (error) { setMessage('Error al restablecer la contraseña'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleChangeMyPassword = async (e) => {
    e.preventDefault();
    if (myPassword.new !== myPassword.confirm) { setMessage('Las contraseñas no coinciden'); return; }
    if (myPassword.new.length < 6) { setMessage('La contraseña debe tener al menos 6 caracteres'); return; }
    try {
      await usersAPI.changeMyPassword(myPassword.current, myPassword.new);
      setMyPassword({ current: '', new: '', confirm: '' });
      setMessage('Contraseña cambiada correctamente');
    } catch (error) { setMessage('Error al cambiar la contraseña'); }
    setTimeout(() => setMessage(''), 3000);
  };

  if (!user || !isAdmin()) return null;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-lime-400">Panel de Administración</h1>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
          <div className="mb-6 text-lime-300">
            <p>Bienvenido, <strong>{user.email}</strong></p>
            <p className="text-sm text-gray-400">Rol: {user.role}</p>
          </div>

          {message && (
            <div className="mb-4 bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded">
              {message}
            </div>
          )}

          <div className="flex gap-2 mb-6 border-b border-lime-500/20 pb-4">
            <button onClick={() => setActiveTab('posts')} className={`px-4 py-2 rounded font-bold transition ${activeTab === 'posts' ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>Posts</button>
            <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded font-bold transition ${activeTab === 'users' ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>Usuarios</button>
            <button onClick={() => setActiveTab('mypassword')} className={`px-4 py-2 rounded font-bold transition ${activeTab === 'mypassword' ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>Mi Contraseña</button>
          </div>

          {activeTab === 'posts' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-lime-400">Posts</h2>
                <button onClick={() => setShowForm(!showForm)} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded transition">
                  {showForm ? 'Ver Posts' : 'Nuevo Post'}
                </button>
              </div>

              {showForm ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-2xl font-bold text-lime-400 mb-4">{editingPost ? 'Editar Post' : 'Crear Nuevo Post'}</h2>
                  <div>
                    <label className="block text-lime-300 mb-2">Título</label>
                    <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
                  </div>
                  <div>
                    <label className="block text-lime-300 mb-2">Extracto</label>
                    <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} required rows={2} className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
                  </div>
                  <div>
                    <label className="block text-lime-300 mb-2">Contenido (Markdown)</label>
                    <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required rows={12} className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-lime-400" />
                  </div>
                  <div>
                    <label className="flex items-center text-lime-300">
                      <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })} className="mr-2" />
                      Publicar
                    </label>
                  </div>
                  <div className="flex gap-4">
                    <button type="submit" disabled={loading} className="flex-1 bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50">{loading ? 'Guardando...' : editingPost ? 'Actualizar Post' : 'Crear Post'}</button>
                    <button type="button" onClick={handleCancel} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded transition">Cancelar</button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-gray-900/50 border border-lime-500/20 rounded p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-lime-400 mb-1">{post.title}</h3>
                          <p className="text-lime-200 text-sm mb-2">{post.excerpt}</p>
                          <div className="flex gap-4 text-xs text-gray-400">
                            <span>{new Date(post.created_at).toLocaleDateString('es-ES')}</span>
                            <span className={post.published ? 'text-green-400' : 'text-yellow-400'}>{post.published ? 'Publicado' : 'Borrador'}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(post)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition">Editar</button>
                          <button onClick={() => handleDelete(post.id)} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-bold text-lime-400 mb-6">Gestión de Usuarios</h2>

              <form onSubmit={handleCreateUser} className="bg-gray-900/50 border border-lime-500/20 rounded p-4 mb-6 space-y-4">
                <h3 className="text-lg font-bold text-lime-300">Crear nuevo usuario</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-lime-300 mb-2">Email</label>
                    <input type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
                  </div>
                  <div>
                    <label className="block text-lime-300 mb-2">Contraseña</label>
                    <input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} required className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
                  </div>
                  <div>
                    <label className="block text-lime-300 mb-2">Rol</label>
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400">
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded transition disabled:opacity-50">Crear Usuario</button>
              </form>

              <div className="space-y-3">
                {users.map((u) => (
                  <div key={u.id} className="bg-gray-900/50 border border-lime-500/20 rounded p-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <p className="text-lime-300 font-bold">{u.email}</p>
                        <p className="text-gray-400 text-sm">Rol: <span className="text-lime-400">{u.role}</span></p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="password" placeholder="Nueva contraseña" value={resetPasswords[u.id] || ''} onChange={(e) => setResetPasswords({ ...resetPasswords, [u.id]: e.target.value })} className="bg-gray-900 border border-lime-500/30 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-lime-400 w-40" />
                        <button onClick={() => handleResetPassword(u.id)} className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm transition">Restablecer</button>
                        {u.id !== user.id && (
                          <button onClick={() => handleDeleteUser(u.id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">Eliminar</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mypassword' && (
            <div className="max-w-md">
              <h2 className="text-2xl font-bold text-lime-400 mb-6">Cambiar mi contraseña</h2>
              <form onSubmit={handleChangeMyPassword} className="space-y-4">
                <div>
                  <label className="block text-lime-300 mb-2">Contraseña actual</label>
                  <input type="password" value={myPassword.current} onChange={(e) => setMyPassword({ ...myPassword, current: e.target.value })} required className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
                </div>
                <div>
                  <label className="block text-lime-300 mb-2">Nueva contraseña</label>
                  <input type="password" value={myPassword.new} onChange={(e) => setMyPassword({ ...myPassword, new: e.target.value })} required className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
                </div>
                <div>
                  <label className="block text-lime-300 mb-2">Confirmar nueva contraseña</label>
                  <input type="password" value={myPassword.confirm} onChange={(e) => setMyPassword({ ...myPassword, confirm: e.target.value })} required className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
                </div>
                <button type="submit" className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition">Cambiar Contraseña</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
