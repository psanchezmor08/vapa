import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const PortAnalyzer = () => {
  const [mode, setMode] = useState('info');
  const [port, setPort] = useState('');
  const [host, setHost] = useState('');
  const [scanType, setScanType] = useState('common');
  const [result, setResult] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!port) return;
    setError('');
    try {
      const data = await toolsAPI.analyzePort(parseInt(port));
      setResult(data);
    } catch (err) {
      setError('Error al analizar el puerto');
    }
  };

  const handleScan = async () => {
    if (!host) return;
    setLoading(true);
    setError('');
    setScanResult(null);
    try {
      const data = await toolsAPI.scanPorts(host, scanType);
      setScanResult(data);
    } catch (err) {
      setError('Error al escanear el host. Verifica que el host es válido.');
    }
    setLoading(false);
  };

  const commonPorts = [
    { port: 80, name: 'HTTP' }, { port: 443, name: 'HTTPS' },
    { port: 22, name: 'SSH' }, { port: 21, name: 'FTP' },
    { port: 3306, name: 'MySQL' }, { port: 5432, name: 'PostgreSQL' },
    { port: 27017, name: 'MongoDB' }, { port: 6379, name: 'Redis' },
  ];

  const inputClass = "w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">Analizador de Puertos</h2>

        <div className="flex gap-2 mb-6">
          <button onClick={() => { setMode('info'); setResult(null); setScanResult(null); }} className={`px-4 py-2 rounded font-bold transition ${mode === 'info' ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>Info de Puerto</button>
          <button onClick={() => { setMode('scan'); setResult(null); setScanResult(null); }} className={`px-4 py-2 rounded font-bold transition ${mode === 'scan' ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>Escanear Host</button>
        </div>

        {error && <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">{error}</div>}

        {mode === 'info' && (
          <div className="space-y-4">
            <div>
              <label className="block text-lime-300 mb-2">Número de Puerto</label>
              <input type="number" value={port} onChange={(e) => setPort(e.target.value)} placeholder="80" min="1" max="65535" className={inputClass} />
            </div>
            <button onClick={handleAnalyze} disabled={!port} className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50">Analizar Puerto</button>
            {result && (
              <div className="bg-gray-900 border border-lime-500/30 rounded p-4 space-y-2">
                <div><p className="text-lime-300 text-sm">Puerto</p><p className="text-white font-mono text-xl">{result.port}</p></div>
                <div><p className="text-lime-300 text-sm">Servicio</p><p className="text-white font-mono text-lg">{result.service}</p></div>
                <div><p className="text-lime-300 text-sm">Descripción</p><p className="text-white">{result.description}</p></div>
              </div>
            )}
            <div className="bg-gray-900/50 border border-lime-500/20 rounded p-4">
              <p className="text-lime-300 font-bold mb-2">Puertos Comunes</p>
              <div className="grid grid-cols-2 gap-2">
                {commonPorts.map((p) => (
                  <button key={p.port} onClick={() => setPort(p.port.toString())} className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded text-sm transition">{p.port} - {p.name}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === 'scan' && (
          <div className="space-y-4">
            <div>
              <label className="block text-lime-300 mb-2">IP o Dominio</label>
              <input type="text" value={host} onChange={(e) => setHost(e.target.value)} placeholder="192.168.1.1 o ejemplo.com" className={inputClass} />
            </div>
            <div>
              <label className="block text-lime-300 mb-2">Tipo de escaneo</label>
              <select value={scanType} onChange={(e) => setScanType(e.target.value)} className={inputClass}>
                <option value="common">Puertos comunes</option>
                <option value="1-1024">Puertos 1-1024</option>
              </select>
            </div>
            <button onClick={handleScan} disabled={!host || loading} className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50">
              {loading ? 'Escaneando...' : 'Escanear Puertos'}
            </button>
            {loading && <p className="text-lime-300 text-center text-sm">Esto puede tardar unos segundos...</p>}
            {scanResult && (
              <div className="bg-gray-900 border border-lime-500/30 rounded p-4">
                <div className="flex justify-between mb-3">
                  <div>
                    <p className="text-lime-300 text-sm">Host: <span className="text-white">{scanResult.host}</span></p>
                    <p className="text-lime-300 text-sm">IP: <span className="text-white font-mono">{scanResult.ip}</span></p>
                  </div>
                  <p className="text-gray-400 text-sm">Tiempo: {scanResult.scan_time}s</p>
                </div>
                {scanResult.open_ports.length === 0 ? (
                  <p className="text-yellow-400 text-center py-2">No se encontraron puertos abiertos</p>
                ) : (
                  <div>
                    <p className="text-lime-300 font-bold mb-2">{scanResult.open_ports.length} puertos abiertos:</p>
                    <div className="space-y-1">
                      {scanResult.open_ports.map(p => (
                        <div key={p.port} className="flex justify-between bg-gray-800 rounded px-3 py-2">
                          <span className="text-lime-400 font-mono">{p.port}</span>
                          <span className="text-green-400 text-sm">{p.state}</span>
                          <span className="text-gray-300 text-sm">{p.service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortAnalyzer;
