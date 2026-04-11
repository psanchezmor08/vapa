import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI, usersAPI } from '../services/api';

const ProjectsPage = () => {
  const { user, isEditor } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active', member_ids: [] });

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadProjects();
    if (isEditor()) loadUsers();
  }, [user]);

  const loadProjects = async () => {
    try { const data = await projectsAPI.getProjects(); setProjects(data); }
    catch (error) { console.error('Error loading projects:', error); }
  };

  const loadUsers = async () => {
    try { const data = await usersAPI.getUsers(); setUsers(data); }
    catch (error) { console.error('Error loading users:', error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await projectsAPI.createProject(formData);
      setFormData({ name: '', description: '', status: 'active', member_ids: [] });
      setShowForm(false);
      setMessage('Proyecto creado correctamente');
      loadProjects();
    } catch (error) { setMessage('Error al crear el proyecto'); }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      member_ids: prev.member_ids.includes(userId)
        ? prev.member_ids.filter(id => id !== userId)
        : [...prev.member_ids, userId]
    }));
  };

  const statusColor = (status) => {
    if (status === 'active') return 'text-green-400';
    if (status === 'completed') return 'text-blue-400';
    return 'text-gray-400';
  };

  const statusLabel = (status) => {
    if (status === 'active') return 'Activo';
    if (status === 'completed') return 'Completado';
    return 'Archivado';
  };

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-lime-400">Proyectos</h1>
          {isEditor() && (
            <button onClick={() => setShowForm(!showForm)} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded transition">
              {showForm ? 'Cancelar' : 'Nuevo Proyecto'}
            </button>
          )}
        </div>

        {message && (
          <div className="mb-4 bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded">{message}</div>
        )}

        {showForm && isEditor() && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-lime-400 mb-4">Nuevo Proyecto</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-lime-300 mb-2">Nombre</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
              </div>
              <div>
                <label className="block text-lime-300 mb-2">Descripción</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={3} className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
              </div>
              <div>
                <label className="block text-lime-300 mb-2">Estado</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400">
                  <option value="active">Activo</option>
                  <option value="completed">Completado</option>
                  <option value="archived">Archivado</option>
                </select>
              </div>
              {users.length > 0 && (
                <div>
                  <label className="block text-lime-300 mb-2">Miembros</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {users.map(u => (
                      <label key={u.id} className="flex items-center gap-2 text-lime-300 cursor-pointer">
                        <input type="checkbox" checked={formData.member_ids.includes(u.id)} onChange={() => toggleMember(u.id)} className="accent-lime-500" />
                        <span className="text-sm">{u.email}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded transition disabled:opacity-50">
                {loading ? 'Creando...' : 'Crear Proyecto'}
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link key={project.id} to={`/proyectos/${project.id}`} className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6 hover:border-lime-500/50 transition block">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-lime-400">{project.name}</h3>
                <span className={`text-xs font-bold ${statusColor(project.status)}`}>{statusLabel(project.status)}</span>
              </div>
              <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>{project.members.length} miembro{project.members.length !== 1 ? 's' : ''}</span>
                <span>{new Date(project.created_at).toLocaleDateString('es-ES')}</span>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <div className="col-span-3 text-center text-gray-400 py-12">
              No hay proyectos disponibles
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;
