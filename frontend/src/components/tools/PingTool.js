import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const PingTool = () => {
  const [host, setHost] = useState('');
  const [count, setCount] = useState(4);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePing = async () => {
    if (!host) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await toolsAPI.ping(host, count);
      setResult(data);
    } catch (err) {
      setError('Error al ejecutar el ping. Verifica el host.');
    }
    setLoading(false);
  };

  const quickHosts = ['8.8.8.8', '1.1.1.1', 'google.com', 'cloudflare.com'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-2">Ping</h2>
        <p className="text-gray-400 text-sm mb-4">Comprueba la conectividad con un host desde el servidor</p>
        {error && <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-lime-300 mb-2">Host o IP</label>
            <input type="text" value={host} onChange={e => setHost(e.target.value)} placeholder="8.8.8.8 o google.com" className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
          </div>
          <div>
            <label className="block text-lime-300 mb-2">Número de paquetes (1-10)</label>
            <input type="number" value={count} onChange={e => setCount(parseInt(e.target.value))} min="1" max="10" className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
          </div>
          <div className="flex flex-wrap gap-2">
            {quickHosts.map(h => (
              <button key={h} onClick={() => setHost(h)} className="bg-gray-700 hover:bg-gray-600 text-lime-300 px-3 py-1 rounded text-sm transition">{h}</button>
            ))}
          </div>
          <button onClick={handlePing} disabled={!host || loading} className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50">
            {loading ? 'Ejecutando ping...' : 'Hacer Ping'}
          </button>
          {result && (
            <div className={`bg-gray-900 border rounded p-4 ${result.success ? 'border-green-500/50' : 'border-red-500/50'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-lg font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  {result.success ? '✓ Host alcanzable' : '✗ Host no alcanzable'}
                </span>
              </div>
              <pre className="text-gray-300 text-sm font-mono whitespace-pre-wrap overflow-x-auto">{result.output}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PingTool;
