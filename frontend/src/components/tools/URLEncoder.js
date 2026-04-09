import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const URLEncoder = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState('encode'); // encode or decode

  const handleConvert = async () => {
    try {
      const data = await toolsAPI.encodeURL(input, mode === 'encode');
      setOutput(data.result);
    } catch (err) {
      console.error('Error encoding/decoding URL:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">Codificador/Decodificador URL</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={() => setMode('encode')}
              className={`flex-1 py-2 px-4 rounded font-bold transition ${
                mode === 'encode' ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Codificar
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`flex-1 py-2 px-4 rounded font-bold transition ${
                mode === 'decode' ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Decodificar
            </button>
          </div>
          
          <div>
            <label className="block text-lime-300 mb-2">Entrada</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? 'https://ejemplo.com/página?parámetro=valor' : 'https://ejemplo.com/p%C3%A1gina?par%C3%A1metro=valor'}
              rows={4}
              className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-lime-400"
            />
          </div>
          
          <button
            onClick={handleConvert}
            disabled={!input}
            className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50"
          >
            Convertir
          </button>

          {output && (
            <div>
              <label className="block text-lime-300 mb-2">Resultado</label>
              <textarea
                value={output}
                readOnly
                rows={4}
                className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white font-mono text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default URLEncoder;
