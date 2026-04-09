import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const SubnetCalculator = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [cidr, setCidr] = useState(24);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await toolsAPI.calculateSubnet(ipAddress, parseInt(cidr));
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Error al calcular la subred');
      setResult(null);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">Calculadora de Subredes IPv4</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-lime-300 mb-2">Dirección IP</label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="192.168.1.0"
              className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
            />
          </div>
          
          <div>
            <label className="block text-lime-300 mb-2">CIDR (/{cidr})</label>
            <input
              type="range"
              min="0"
              max="32"
              value={cidr}
              onChange={(e) => setCidr(e.target.value)}
              className="w-full"
            />
          </div>
          
          <button
            onClick={handleCalculate}
            disabled={loading || !ipAddress}
            className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50"
          >
            {loading ? 'Calculando...' : 'Calcular'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 p-4 rounded">
                <p className="text-lime-300 text-sm mb-1">Dirección de Red</p>
                <p className="text-white font-mono text-lg">{result.network_address}</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded">
                <p className="text-lime-300 text-sm mb-1">Broadcast</p>
                <p className="text-white font-mono text-lg">{result.broadcast_address}</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded">
                <p className="text-lime-300 text-sm mb-1">Primera IP Usable</p>
                <p className="text-white font-mono text-lg">{result.first_usable_ip}</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded">
                <p className="text-lime-300 text-sm mb-1">Última IP Usable</p>
                <p className="text-white font-mono text-lg">{result.last_usable_ip}</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded">
                <p className="text-lime-300 text-sm mb-1">Máscara de Subred</p>
                <p className="text-white font-mono text-lg">{result.subnet_mask}</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded">
                <p className="text-lime-300 text-sm mb-1">Máscara Wildcard</p>
                <p className="text-white font-mono text-lg">{result.wildcard_mask}</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded">
                <p className="text-lime-300 text-sm mb-1">Hosts Totales</p>
                <p className="text-white font-mono text-lg">{result.total_hosts}</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded">
                <p className="text-lime-300 text-sm mb-1">Hosts Usables</p>
                <p className="text-white font-mono text-lg">{result.usable_hosts}</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded">
                <p className="text-lime-300 text-sm mb-1">Clase IP</p>
                <p className="text-white font-mono text-lg">{result.ip_class}</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded">
                <p className="text-lime-300 text-sm mb-1">Notación CIDR</p>
                <p className="text-white font-mono text-lg">/{result.cidr}</p>
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded">
              <p className="text-lime-300 text-sm mb-1">Red (Binario)</p>
              <p className="text-white font-mono text-xs break-all">{result.network_binary}</p>
            </div>
            
            <div className="bg-gray-900/50 p-4 rounded">
              <p className="text-lime-300 text-sm mb-1">Máscara (Binario)</p>
              <p className="text-white font-mono text-xs break-all">{result.subnet_binary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubnetCalculator;
