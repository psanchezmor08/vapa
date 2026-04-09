import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    try {
      const data = await toolsAPI.generatePassword(length, useUppercase, useLowercase, useDigits, useSymbols);
      setPassword(data.password);
      setStrength(data.strength);
      setCopied(false);
    } catch (err) {
      console.error('Error generating password:', err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">Generador de Contraseñas Seguras</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-lime-300 mb-2">Longitud: {length}</label>
            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={useUppercase}
                onChange={(e) => setUseUppercase(e.target.checked)}
                className="mr-2"
              />
              Mayúsculas (A-Z)
            </label>
            
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={useLowercase}
                onChange={(e) => setUseLowercase(e.target.checked)}
                className="mr-2"
              />
              Minúsculas (a-z)
            </label>
            
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={useDigits}
                onChange={(e) => setUseDigits(e.target.checked)}
                className="mr-2"
              />
              Números (0-9)
            </label>
            
            <label className="flex items-center text-white">
              <input
                type="checkbox"
                checked={useSymbols}
                onChange={(e) => setUseSymbols(e.target.checked)}
                className="mr-2"
              />
              Símbolos (!@#$%...)
            </label>
          </div>
          
          <button
            onClick={handleGenerate}
            className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition"
          >
            Generar Contraseña
          </button>
        </div>

        {password && (
          <div className="space-y-3">
            <div className="bg-gray-900 border border-lime-500/30 rounded p-4">
              <p className="text-white font-mono text-lg break-all">{password}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm font-bold ${
                strength === 'Strong' ? 'text-green-400' :
                strength === 'Medium' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                Seguridad: {strength === 'Strong' ? 'Fuerte' : strength === 'Medium' ? 'Media' : 'Débil'}
              </span>
              
              <button
                onClick={handleCopy}
                className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition"
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordGenerator;
