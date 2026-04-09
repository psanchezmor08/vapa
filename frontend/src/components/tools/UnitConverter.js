import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const UnitConverter = () => {
  const [value, setValue] = useState('');
  const [fromUnit, setFromUnit] = useState('bytes');
  const [toUnit, setToUnit] = useState('kb');
  const [result, setResult] = useState(null);

  const handleConvert = async () => {
    if (!value) return;
    try {
      const data = await toolsAPI.convertUnits(parseFloat(value), fromUnit, toUnit);
      setResult(data.result);
    } catch (err) {
      console.error('Error converting units:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">Convertidor de Unidades</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-lime-300 mb-2">Valor</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="1024"
              className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-lime-300 mb-2">De</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value)}
                className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
              >
                <option value="bytes">Bytes</option>
                <option value="kb">KB</option>
                <option value="mb">MB</option>
                <option value="gb">GB</option>
                <option value="tb">TB</option>
              </select>
            </div>
            
            <div>
              <label className="block text-lime-300 mb-2">A</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(e.target.value)}
                className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
              >
                <option value="bytes">Bytes</option>
                <option value="kb">KB</option>
                <option value="mb">MB</option>
                <option value="gb">GB</option>
                <option value="tb">TB</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleConvert}
            disabled={!value}
            className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50"
          >
            Convertir
          </button>

          {result !== null && (
            <div className="bg-gray-900 border border-lime-500/30 rounded p-4">
              <p className="text-lime-300 text-sm mb-1">Resultado</p>
              <p className="text-white font-mono text-2xl">{result} {toUnit.toUpperCase()}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;
