import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { projectsAPI, usersAPI } from '../services/api';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState([]);
  const [errors, setErrors] = useState([]);
  const [docs, setDocs] = useState([]);
  const [reports, setReports] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [newMember, setNewMember] = useState({ user_id: '', role: 'member' });
  const [fileCategory, setFileCategory] = useState('other');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadProject();
    loadMembers();
  }, [user, id]);

  useEffect(() => {
    if (!project) return;
    if (activeTab === 'tasks') loadTasks();
    if (activeTab === 'errors') loadErrors();
    if (activeTab === 'docs') loadDocs();
    if (activeTab === 'reports') loadReports();
    if (activeTab === 'files') loadFiles();
    if (activeTab === 'members') { loadMembers(); loadAvailableUsers(); }
  }, [activeTab, project]);

  const loadProject = async () => {
    try { const data = await projectsAPI.getProject(id); setProject(data); }
    catch (error) { navigate('/proyectos'); }
  };

  const loadMembers = async () => {
    try { const data = await projectsAPI.getMembers(id); setMembers(data); }
    catch (error) { console.error(error); }
  };

  const loadAvailableUsers = async () => {
    try { const data = await projectsAPI.getAvailableUsers(id); setAvailableUsers(data); }
    catch (error) { console.error(error); }
  };

  const loadTasks = async () => {
    try { const data = await projectsAPI.getTasks(id); setTasks(data); }
    catch (error) { console.error(error); }
  };

  const loadErrors = async () => {
    try { const data = await projectsAPI.getErrors(id); setErrors(data); }
    catch (error) { console.error(error); }
  };

  const loadDocs = async () => {
    try { const data = await projectsAPI.getDocs(id); setDocs(data); }
    catch (error) { console.error(error); }
  };

  const loadReports = async () => {
    try { const data = await projectsAPI.getReports(id); setReports(data); }
    catch (error) { console.error(error); }
  };

  const loadFiles = async () => {
    try { const data = await projectsAPI.getFiles(id); setFiles(data); }
    catch (error) { console.error(error); }
  };

  const showMsg = (msg) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };
  const openForm = (defaults = {}, item = null) => { setFormData(defaults); setEditingItem(item); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingItem(null); setFormData({}); };

  const isOwnerOrAdmin = () => {
    if (!project || !user) return false;
    if (isAdmin()) return true;
    if (project.created_by === user.id) return true;
    return members.some(m => m.user_id === user.id && ['owner', 'manager'].includes(m.role));
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingItem) { await projectsAPI.updateTask(id, editingItem.id, formData); }
      else { await projectsAPI.createTask(id, formData); }
      closeForm(); loadTasks(); showMsg('Tarea guardada');
    } catch (error) { showMsg('Error al guardar la tarea'); }
    setLoading(false);
  };

  const handleErrorSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingItem) { await projectsAPI.updateError(id, editingItem.id, formData); }
      else { await projectsAPI.createError(id, formData); }
      closeForm(); loadErrors(); showMsg('Error guardado');
    } catch (error) { showMsg('Error al guardar'); }
    setLoading(false);
  };

  const handleDocSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      if (editingItem) { await projectsAPI.updateDoc(id, editingItem.id, formData); }
      else { await projectsAPI.createDoc(id, formData); }
      closeForm(); loadDocs(); showMsg('Documento guardado');
    } catch (error) { showMsg('Error al guardar el documento'); }
    setLoading(false);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await projectsAPI.createReport(id, formData);
      closeForm(); loadReports(); showMsg('Informe creado');
    } catch (error) { showMsg('Error al crear el informe'); }
    setLoading(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      await projectsAPI.uploadFile(id, file, fileCategory);
      loadFiles(); showMsg('Archivo subido correctamente');
    } catch (error) { showMsg('Error al subir el archivo'); }
    setLoading(false);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.user_id) return;
    setLoading(true);
    try {
      await projectsAPI.addMember(id, newMember.user_id, newMember.role);
      setNewMember({ user_id: '', role: 'member' });
      loadMembers(); loadAvailableUsers(); showMsg('Miembro añadido');
    } catch (error) { showMsg('Error al añadir el miembro'); }
    setLoading(false);
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('¿Eliminar este miembro del proyecto?')) return;
    try {
      await projectsAPI.removeMember(id, userId);
      loadMembers(); loadAvailableUsers(); showMsg('Miembro eliminado');
    } catch (error) { showMsg('Error al eliminar el miembro'); }
  };

  const handleUpdateRole = async (userId, role) => {
    try {
      await projectsAPI.updateMemberRole(id, userId, role);
      loadMembers(); showMsg('Rol actualizado');
    } catch (error) { showMsg('Error al actualizar el rol'); }
  };

  const getMemberEmail = (userId) => {
    const m = members.find(m => m.user_id === userId);
    return m ? m.email : userId;
  };

  const tabClass = (tab) => `px-4 py-2 rounded font-bold transition ${activeTab === tab ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'}`;
  const inputClass = "w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400";
  const severityColor = (s) => ({ low: 'text-blue-400', medium: 'text-yellow-400', high: 'text-orange-400', critical: 'text-red-400' }[s] || 'text-gray-400');
  const statusColor = (s) => ({ pending: 'text-yellow-400', in_progress: 'text-blue-400', completed: 'text-green-400', open: 'text-red-400', resolved: 'text-green-400' }[s] || 'text-gray-400');
  const roleColor = (r) => ({ owner: 'text-red-400', manager: 'text-yellow-400', member: 'text-lime-400' }[r] || 'text-gray-400');
  const categoryLabel = (c) => ({ report: 'Informe', documentation: 'Documentación', other: 'Otro' }[c] || 'Otro');

  if (!project) return <div className="min-h-screen flex items-center justify-center text-lime-400">Cargando...</div>;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button onClick={() => navigate('/proyectos')} className="text-lime-400 hover:text-lime-300 mb-4 flex items-center gap-2">← Volver a proyectos</button>
          <h1 className="text-4xl font-bold text-lime-400">{project.name}</h1>
          <p className="text-gray-300 mt-2">{project.description}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-400">
            <span>Estado: <span className="text-lime-400">{project.status}</span></span>
            <span>Miembros: <span className="text-lime-400">{members.length}</span></span>
          </div>
        </div>

        {message && <div className="mb-4 bg-lime-900/50 border border-lime-500 text-lime-200 px-4 py-3 rounded">{message}</div>}

        <div className="flex flex-wrap gap-2 mb-6 border-b border-lime-500/20 pb-4">
          {['tasks', 'errors', 'docs', 'reports', 'files', 'members'].map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setShowForm(false); }} className={tabClass(tab)}>
              {tab === 'tasks' ? 'Tareas' : tab === 'errors' ? 'Errores' : tab === 'docs' ? 'Documentación' : tab === 'reports' ? 'Informes' : tab === 'files' ? 'Archivos' : 'Miembros'}
            </button>
          ))}
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">

          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-lime-400">Tareas</h2>
                <button onClick={() => openForm({ title: '', description: '', status: 'pending', assigned_to: '' })} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition">Nueva Tarea</button>
              </div>
              {showForm && (
                <form onSubmit={handleTaskSubmit} className="bg-gray-900/50 border border-lime-500/20 rounded p-4 mb-4 space-y-3">
                  <input type="text" placeholder="Título" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} required className={inputClass} />
                  <textarea placeholder="Descripción" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className={inputClass} />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={formData.status || 'pending'} onChange={e => setFormData({...formData, status: e.target.value})} className={inputClass}>
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En progreso</option>
                      <option value="completed">Completada</option>
                    </select>
                    <select value={formData.assigned_to || ''} onChange={e => setFormData({...formData, assigned_to: e.target.value})} className={inputClass}>
                      <option value="">Sin asignar</option>
                      {members.map(m => <option key={m.user_id} value={m.user_id}>{m.email}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition disabled:opacity-50">{loading ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}</button>
                    <button type="button" onClick={closeForm} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition">Cancelar</button>
                  </div>
                </form>
              )}
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task.id} className="bg-gray-900/50 border border-lime-500/20 rounded p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lime-300">{task.title}</h3>
                      {task.description && <p className="text-gray-400 text-sm mt-1">{task.description}</p>}
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className={statusColor(task.status)}>{task.status === 'pending' ? 'Pendiente' : task.status === 'in_progress' ? 'En progreso' : 'Completada'}</span>
                        {task.assigned_to && <span className="text-gray-400">Asignado: {getMemberEmail(task.assigned_to)}</span>}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => openForm({title: task.title, description: task.description, status: task.status, assigned_to: task.assigned_to}, task)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition">Editar</button>
                      <button onClick={async () => { await projectsAPI.deleteTask(id, task.id); loadTasks(); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">Eliminar</button>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && <p className="text-gray-400 text-center py-4">No hay tareas</p>}
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-lime-400">Errores</h2>
                <button onClick={() => openForm({ title: '', description: '', severity: 'medium', status: 'open' })} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition">Nuevo Error</button>
              </div>
              {showForm && (
                <form onSubmit={handleErrorSubmit} className="bg-gray-900/50 border border-lime-500/20 rounded p-4 mb-4 space-y-3">
                  <input type="text" placeholder="Título" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} required className={inputClass} />
                  <textarea placeholder="Descripción" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className={inputClass} />
                  <div className="grid grid-cols-2 gap-3">
                    <select value={formData.severity || 'medium'} onChange={e => setFormData({...formData, severity: e.target.value})} className={inputClass}>
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                    <select value={formData.status || 'open'} onChange={e => setFormData({...formData, status: e.target.value})} className={inputClass}>
                      <option value="open">Abierto</option>
                      <option value="resolved">Resuelto</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition disabled:opacity-50">{loading ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}</button>
                    <button type="button" onClick={closeForm} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition">Cancelar</button>
                  </div>
                </form>
              )}
              <div className="space-y-3">
                {errors.map(error => (
                  <div key={error.id} className="bg-gray-900/50 border border-lime-500/20 rounded p-4 flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-bold text-lime-300">{error.title}</h3>
                      {error.description && <p className="text-gray-400 text-sm mt-1">{error.description}</p>}
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className={severityColor(error.severity)}>Severidad: {error.severity === 'low' ? 'Baja' : error.severity === 'medium' ? 'Media' : error.severity === 'high' ? 'Alta' : 'Crítica'}</span>
                        <span className={statusColor(error.status)}>{error.status === 'open' ? 'Abierto' : 'Resuelto'}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => openForm({title: error.title, description: error.description, severity: error.severity, status: error.status}, error)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition">Editar</button>
                      <button onClick={async () => { await projectsAPI.deleteError(id, error.id); loadErrors(); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">Eliminar</button>
                    </div>
                  </div>
                ))}
                {errors.length === 0 && <p className="text-gray-400 text-center py-4">No hay errores registrados</p>}
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-lime-400">Documentación</h2>
                <button onClick={() => openForm({ title: '', content: '' })} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition">Nuevo Documento</button>
              </div>
              {showForm && (
                <form onSubmit={handleDocSubmit} className="bg-gray-900/50 border border-lime-500/20 rounded p-4 mb-4 space-y-3">
                  <input type="text" placeholder="Título" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} required className={inputClass} />
                  <textarea placeholder="Contenido (Markdown)" value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} rows={8} className={`${inputClass} font-mono text-sm`} />
                  <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition disabled:opacity-50">{loading ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}</button>
                    <button type="button" onClick={closeForm} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition">Cancelar</button>
                  </div>
                </form>
              )}
              <div className="space-y-3">
                {docs.map(doc => (
                  <div key={doc.id} className="bg-gray-900/50 border border-lime-500/20 rounded p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lime-300 mb-2">{doc.title}</h3>
                        <p className="text-gray-400 text-sm whitespace-pre-wrap line-clamp-3">{doc.content}</p>
                        <p className="text-gray-500 text-xs mt-2">{new Date(doc.updated_at).toLocaleDateString('es-ES')}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => openForm({title: doc.title, content: doc.content}, doc)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition">Editar</button>
                        <button onClick={async () => { await projectsAPI.deleteDoc(id, doc.id); loadDocs(); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
                {docs.length === 0 && <p className="text-gray-400 text-center py-4">No hay documentación</p>}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-lime-400">Informes</h2>
                <button onClick={() => openForm({ title: '', content: '', report_type: 'manual' })} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition">Nuevo Informe</button>
              </div>
              {showForm && (
                <form onSubmit={handleReportSubmit} className="bg-gray-900/50 border border-lime-500/20 rounded p-4 mb-4 space-y-3">
                  <input type="text" placeholder="Título del informe" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} required className={inputClass} />
                  <div>
                    <label className="block text-lime-300 mb-2 text-sm">Tipo de informe</label>
                    <select value={formData.report_type || 'manual'} onChange={e => setFormData({...formData, report_type: e.target.value})} className={inputClass}>
                      <option value="manual">Manual — escribir contenido</option>
                      <option value="auto">Automático — generado con datos del proyecto</option>
                    </select>
                  </div>
                  {formData.report_type === 'manual' && (
                    <textarea placeholder="Contenido del informe (Markdown)" value={formData.content || ''} onChange={e => setFormData({...formData, content: e.target.value})} rows={10} className={`${inputClass} font-mono text-sm`} />
                  )}
                  <div className="flex gap-2">
                    <button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition disabled:opacity-50">{loading ? 'Generando...' : 'Crear Informe'}</button>
                    <button type="button" onClick={closeForm} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition">Cancelar</button>
                  </div>
                </form>
              )}
              <div className="space-y-3">
                {reports.map(report => (
                  <div key={report.id} className="bg-gray-900/50 border border-lime-500/20 rounded p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lime-300">{report.title}</h3>
                        <div className="flex gap-4 mt-1 text-xs text-gray-400">
                          <span>{report.report_type === 'auto' ? 'Automático' : 'Manual'}</span>
                          <span>{new Date(report.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button onClick={() => projectsAPI.downloadReport(id, report.id, 'pdf')} className="bg-red-700 hover:bg-red-800 text-white px-3 py-1 rounded text-sm transition">PDF</button>
                        <button onClick={() => projectsAPI.downloadReport(id, report.id, 'docx')} className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded text-sm transition">DOCX</button>
                        <button onClick={async () => { await projectsAPI.deleteReport(id, report.id); loadReports(); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
                {reports.length === 0 && <p className="text-gray-400 text-center py-4">No hay informes</p>}
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-lime-400">Archivos</h2>
                <div className="flex gap-2 items-center">
                  <select value={fileCategory} onChange={e => setFileCategory(e.target.value)} className="bg-gray-900 border border-lime-500/30 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-lime-400">
                    <option value="other">Otro</option>
                    <option value="report">Informe</option>
                    <option value="documentation">Documentación</option>
                  </select>
                  <label className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition cursor-pointer">
                    Subir Archivo
                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg" />
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                {files.map(file => (
                  <div key={file.id} className="bg-gray-900/50 border border-lime-500/20 rounded p-4 flex justify-between items-center">
                    <div>
                      <p className="text-lime-300 font-bold">{file.original_name}</p>
                      <div className="flex gap-3 mt-1 text-xs text-gray-400">
                        <span className="text-lime-500">{categoryLabel(file.category)}</span>
                        <span>{(file.file_size / 1024).toFixed(1)} KB</span>
                        <span>{new Date(file.created_at).toLocaleDateString('es-ES')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => projectsAPI.downloadFile(id, file.id)} className="bg-lime-600 hover:bg-lime-700 text-white px-3 py-1 rounded text-sm transition">Descargar</button>
                      <button onClick={async () => { await projectsAPI.deleteFile(id, file.id); loadFiles(); }} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">Eliminar</button>
                    </div>
                  </div>
                ))}
                {files.length === 0 && <p className="text-gray-400 text-center py-4">No hay archivos</p>}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <h2 className="text-2xl font-bold text-lime-400 mb-6">Miembros del Proyecto</h2>

              {isOwnerOrAdmin() && availableUsers.length > 0 && (
                <form onSubmit={handleAddMember} className="bg-gray-900/50 border border-lime-500/20 rounded p-4 mb-6">
                  <h3 className="text-lg font-bold text-lime-300 mb-3">Añadir miembro</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <select value={newMember.user_id} onChange={e => setNewMember({...newMember, user_id: e.target.value})} required className={inputClass}>
                      <option value="">Seleccionar usuario</option>
                      {availableUsers.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
                    </select>
                    <select value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})} className={inputClass}>
                      <option value="member">Miembro</option>
                      <option value="manager">Manager</option>
                      <option value="owner">Owner</option>
                    </select>
                    <button type="submit" disabled={loading} className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition disabled:opacity-50">Añadir</button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {members.map(member => (
                  <div key={member.user_id} className="bg-gray-900/50 border border-lime-500/20 rounded p-4 flex justify-between items-center">
                    <div>
                      <p className="text-lime-300 font-bold">{member.email}</p>
                      <p className={`text-xs mt-1 ${roleColor(member.role)}`}>{member.role === 'owner' ? 'Propietario' : member.role === 'manager' ? 'Manager' : 'Miembro'}</p>
                    </div>
                    {isOwnerOrAdmin() && (
                      <div className="flex gap-2 items-center">
                        <select value={member.role} onChange={e => handleUpdateRole(member.user_id, e.target.value)} className="bg-gray-900 border border-lime-500/30 rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-lime-400">
                          <option value="member">Miembro</option>
                          <option value="manager">Manager</option>
                          <option value="owner">Owner</option>
                        </select>
                        <button onClick={() => handleRemoveMember(member.user_id)} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition">Eliminar</button>
                      </div>
                    )}
                  </div>
                ))}
                {members.length === 0 && <p className="text-gray-400 text-center py-4">No hay miembros asignados</p>}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;
