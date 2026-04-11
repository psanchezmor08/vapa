import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const IPv4toIPv6 = () => {
  const [ip, setIp] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleConvert = async () => {
    if (!ip) return;
    setError(''); setResult(null);
    try {
      const data = await toolsAPI.ipv4ToIpv6(ip);
      setResult(data);
    } catch (err) {
      setError('IP inválida. Introduce una IPv4 válida.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const examples = ['192.168.1.1', '10.0.0.1', '8.8.8.8', '172.16.0.1'];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-2">Conversor IPv4 a IPv6</h2>
        <p className="text-gray-400 text-sm mb-4">Convierte una dirección IPv4 a sus representaciones IPv6 equivalentes</p>
        {error && <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-lime-300 mb-2">Dirección IPv4</label>
            <input type="text" value={ip} onChange={e => setIp(e.target.value)} placeholder="192.168.1.1" className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" onKeyDown={e => e.key === 'Enter' && handleConvert()} />
          </div>
          <div className="flex flex-wrap gap-2">
            {examples.map(ex => (
              <button key={ex} onClick={() => setIp(ex)} className="bg-gray-700 hover:bg-gray-600 text-lime-300 px-3 py-1 rounded text-sm transition">{ex}</button>
            ))}
          </div>
          <button onClick={handleConvert} disabled={!ip} className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50">Convertir</button>
          {result && (
            <div className="space-y-3">
              {[
                { label: 'IPv4 original', value: result.ipv4 },
                { label: 'IPv6 Mapeada (::ffff:x:x)', value: result.ipv6_mapped, desc: 'Formato estándar para IPv4 en IPv6' },
                { label: 'IPv6 Compatible (::x:x)', value: result.ipv6_compatible, desc: 'Formato compatible legacy' },
                { label: 'IPv6 6to4 (2002::/16)', value: result.ipv6_6to4, desc: 'Túnel 6to4 automático' },
              ].map(item => (
                <div key={item.label} className="bg-gray-900 border border-lime-500/20 rounded p-3">
                  <p className="text-lime-300 text-sm font-bold">{item.label}</p>
                  {item.desc && <p className="text-gray-500 text-xs mb-1">{item.desc}</p>}
                  <div className="flex justify-between items-center">
                    <p className="text-white font-mono text-sm">{item.value}</p>
                    <button onClick={() => copyToClipboard(item.value)} className="text-gray-400 hover:text-lime-400 text-xs transition ml-2">Copiar</button>
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

export default IPv4toIPv6;
