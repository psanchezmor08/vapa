import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const HashGenerator = () => {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState('sha256');
  const [hash, setHash] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      const data = await toolsAPI.generateHash(input, algorithm);
      setHash(data.hash);
      setCopied(false);
    } catch (err) {
      console.error('Error generating hash:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">Generador de Hash</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-lime-300 mb-2">Algoritmo</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
            >
              <option value="md5">MD5</option>
              <option value="sha1">SHA-1</option>
              <option value="sha256">SHA-256</option>
              <option value="sha512">SHA-512</option>
            </select>
          </div>
          
          <div>
            <label className="block text-lime-300 mb-2">Texto</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Texto a hashear"
              rows={4}
              className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
            />
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={!input}
            className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50"
          >
            Generar Hash
          </button>

          {hash && (
            <div className="space-y-3">
              <div className="bg-gray-900 border border-lime-500/30 rounded p-4">
                <p className="text-white font-mono text-sm break-all">{hash}</p>
              </div>
              
              <button
                onClick={handleCopy}
                className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition"
              >
                {copied ? 'Copiado!' : 'Copiar Hash'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HashGenerator;
