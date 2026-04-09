import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const UUIDGenerator = () => {
  const [uuid, setUuid] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      const data = await toolsAPI.generateUUID();
      setUuid(data.uuid);
      setCopied(false);
    } catch (err) {
      console.error('Error generating UUID:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">Generador UUID/GUID</h2>
        
        <div className="space-y-4">
          <button
            onClick={handleGenerate}
            className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition"
          >
            Generar UUID
          </button>

          {uuid && (
            <div className="space-y-3">
              <div className="bg-gray-900 border border-lime-500/30 rounded p-4">
                <p className="text-white font-mono text-lg break-all">{uuid}</p>
              </div>
              
              <button
                onClick={handleCopy}
                className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition"
              >
                {copied ? 'Copiado!' : 'Copiar UUID'}
              </button>
            </div>
          )}
          
          <div className="bg-gray-900/50 border border-lime-500/20 rounded p-4 text-sm text-lime-200">
            <p className="mb-2"><strong>UUID (Universally Unique Identifier)</strong></p>
            <p>Identificador único de 128 bits. Formato: 8-4-4-4-12 caracteres hexadecimales.</p>
            <p className="mt-2">Ejemplo: 550e8400-e29b-41d4-a716-446655440000</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UUIDGenerator;
