import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const JSONValidator = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [error, setError] = useState('');

  const handleValidate = async () => {
    try {
      const data = await toolsAPI.validateJSON(input);
      setIsValid(data.valid);
      if (data.valid) {
        setOutput(data.formatted);
        setError('');
      } else {
        setError(data.error);
        setOutput('');
      }
    } catch (err) {
      console.error('Error validating JSON:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">Validador y Formateador JSON</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-lime-300 mb-2">JSON a Validar</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"clave": "valor"}'
              rows={8}
              className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white font-mono text-sm focus:outline-none focus:border-lime-400"
            />
          </div>
          
          <button
            onClick={handleValidate}
            disabled={!input}
            className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50"
          >
            Validar y Formatear
          </button>

          {isValid !== null && (
            <div className={`px-4 py-3 rounded ${
              isValid ? 'bg-green-900/50 border border-green-500 text-green-200' : 'bg-red-900/50 border border-red-500 text-red-200'
            }`}>
              {isValid ? 'JSON válido' : `JSON inválido: ${error}`}
            </div>
          )}

          {output && (
            <div>
              <label className="block text-lime-300 mb-2">JSON Formateado</label>
              <textarea
                value={output}
                readOnly
                rows={12}
                className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white font-mono text-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JSONValidator;
