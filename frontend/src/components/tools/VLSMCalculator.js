import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const VLSMCalculator = () => {
  const [network, setNetwork] = useState('');
  const [subnetsInput, setSubnetsInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCalculate = async () => {
    if (!network || !subnetsInput) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const subnets = subnetsInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const data = await toolsAPI.vlsm(network, subnets);
      setResult(data);
    } catch (err) {
      setError('Error al calcular. Verifica la red y los hosts requeridos.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-2">Calculadora VLSM</h2>
        <p className="text-gray-400 text-sm mb-4">Variable Length Subnet Masking — divide una red en subredes de tamaño variable</p>
        {error && <div className="mb-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-lime-300 mb-2">Red base (ej: 192.168.1.0/24)</label>
            <input type="text" value={network} onChange={e => setNetwork(e.target.value)} placeholder="192.168.1.0/24" className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
          </div>
          <div>
            <label className="block text-lime-300 mb-2">Hosts requeridos por subred (separados por comas)</label>
            <input type="text" value={subnetsInput} onChange={e => setSubnetsInput(e.target.value)} placeholder="50, 25, 10, 5" className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400" />
            <p className="text-gray-500 text-xs mt-1">Ejemplo: 50, 25, 10 → crea 3 subredes para 50, 25 y 10 hosts</p>
          </div>
          <button onClick={handleCalculate} disabled={!network || !subnetsInput || loading} className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50">
            {loading ? 'Calculando...' : 'Calcular VLSM'}
          </button>
          {result && (
            <div className="space-y-3">
              <p className="text-lime-300 font-bold">{result.subnets.length} subredes calculadas:</p>
              {result.subnets.map((subnet, i) => (
                <div key={i} className="bg-gray-900 border border-lime-500/20 rounded p-4">
                  <p className="text-lime-400 font-bold mb-2">Subred {i + 1} — {subnet.network}/{subnet.cidr}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><p className="text-gray-400">Red</p><p className="text-white font-mono">{subnet.network}</p></div>
                    <div><p className="text-gray-400">Broadcast</p><p className="text-white font-mono">{subnet.broadcast}</p></div>
                    <div><p className="text-gray-400">Primer host</p><p className="text-white font-mono">{subnet.first_host}</p></div>
                    <div><p className="text-gray-400">Último host</p><p className="text-white font-mono">{subnet.last_host}</p></div>
                    <div><p className="text-gray-400">Máscara</p><p className="text-white font-mono">{subnet.mask}</p></div>
                    <div><p className="text-gray-400">Hosts útiles</p><p className="text-white font-mono">{subnet.hosts}</p></div>
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

export default VLSMCalculator;
