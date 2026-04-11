import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const DNSLookup = () => {
  const [domain, setDomain] = useState('');
  const [recordType, setRecordType] = useState('A');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async () => {
    if (!domain) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const data = await toolsAPI.dnsLookup(domain, recordType);
      setResult(data);
    } catch (err) {
      setError('Error al realizar la consulta DNS.');
    }
    setLoading(false);
  };

  const recordTypes = ['A', 'AAAA', 'MX', 'CNAME', 'TXT', 'NS'];
  const examples = ['google.com', 'cloudflare.com', 'github.com', 'vapa.es'];

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-2">DNS Lookup</h2>
        <p className="text-gray-400 text-sm mb-4">Consulta registros DNS de cualquier dominio</p>
        {error && <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-lime-300 mb-2">Dominio</label>
            <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="google.com" className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" onKeyDown={e => e.key === 'Enter' && handleLookup()} />
          </div>
          <div>
            <label className="block text-lime-300 mb-2">Tipo de registro</label>
            <div className="flex flex-wrap gap-2">
              {recordTypes.map(type => (
                <button key={type} onClick={() => setRecordType(type)} className={`px-4 py-2 rounded font-bold transition ${recordType === type ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>{type}</button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map(ex => (
              <button key={ex} onClick={() => setDomain(ex)} className="bg-gray-700 hover:bg-gray-600 text-lime-300 px-3 py-1 rounded text-sm transition">{ex}</button>
            ))}
          </div>
          <button onClick={handleLookup} disabled={!domain || loading} className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50">
            {loading ? 'Consultando...' : 'Consultar DNS'}
          </button>
          {result && (
            <div className="bg-gray-900 border border-lime-500/30 rounded p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-lime-300 font-bold">{result.domain} — {result.record_type}</p>
                <span className="text-gray-400 text-xs">{result.records.length} registro{result.records.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {result.records.map((record, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-800 rounded px-3 py-2">
                    <p className="text-white font-mono text-sm">{record}</p>
                    <button onClick={() => copyToClipboard(record)} className="text-gray-400 hover:text-lime-400 text-xs transition ml-2">Copiar</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DNSLookup;
