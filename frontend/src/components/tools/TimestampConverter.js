import React, { useState } from 'react';

const TimestampConverter = () => {
  const [timestamp, setTimestamp] = useState('');
  const [humanDate, setHumanDate] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [mode, setMode] = useState('toHuman'); // toHuman or toTimestamp

  const handleConvertToHuman = () => {
    try {
      const ts = parseInt(timestamp);
      const date = new Date(ts * 1000);
      
      const options = {
        timeZone: timezone === 'local' ? undefined : timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      };
      
      setHumanDate(date.toLocaleString('es-ES', options));
    } catch (error) {
      setHumanDate('Error: Timestamp inválido');
    }
  };

  const handleConvertToTimestamp = () => {
    try {
      const date = new Date(humanDate);
      const ts = Math.floor(date.getTime() / 1000);
      setTimestamp(ts.toString());
    } catch (error) {
      setTimestamp('Error: Fecha inválida');
    }
  };

  const handleNow = () => {
    const now = Math.floor(Date.now() / 1000);
    setTimestamp(now.toString());
    handleConvertToHuman();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">Conversor de Timestamps Unix</h2>
        
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('toHuman')}
            className={`flex-1 py-2 px-4 rounded font-bold transition ${
              mode === 'toHuman' ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Timestamp → Fecha
          </button>
          <button
            onClick={() => setMode('toTimestamp')}
            className={`flex-1 py-2 px-4 rounded font-bold transition ${
              mode === 'toTimestamp' ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Fecha → Timestamp
          </button>
        </div>

        {mode === 'toHuman' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-lime-300 mb-2">Unix Timestamp (segundos)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  placeholder="1234567890"
                  className="flex-1 bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
                />
                <button
                  onClick={handleNow}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                >
                  Ahora
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-lime-300 mb-2">Zona Horaria</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
              >
                <option value="UTC">UTC</option>
                <option value="Europe/Madrid">Madrid (España)</option>
                <option value="Europe/London">Londres (UK)</option>
                <option value="America/New_York">Nueva York (USA)</option>
                <option value="America/Los_Angeles">Los Angeles (USA)</option>
                <option value="Asia/Tokyo">Tokyo (Japón)</option>
                <option value="local">Local del Navegador</option>
              </select>
            </div>
            
            <button
              onClick={handleConvertToHuman}
              disabled={!timestamp}
              className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50"
            >
              Convertir a Fecha
            </button>

            {humanDate && (
              <div className="bg-gray-900 border border-lime-500/30 rounded p-4">
                <div className="flex justify-between items-center">
                  <p className="text-white text-lg">{humanDate}</p>
                  <button
                    onClick={() => handleCopy(humanDate)}
                    className="bg-lime-500 hover:bg-lime-600 text-gray-900 px-3 py-1 rounded text-sm transition"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-lime-300 mb-2">Fecha y Hora</label>
              <input
                type="datetime-local"
                value={humanDate}
                onChange={(e) => setHumanDate(e.target.value)}
                className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
              />
              <p className="text-xs text-gray-400 mt-1">O escribe una fecha como: 2024-12-25 18:30:00</p>
            </div>
            
            <button
              onClick={handleConvertToTimestamp}
              disabled={!humanDate}
              className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50"
            >
              Convertir a Timestamp
            </button>

            {timestamp && timestamp !== '' && !timestamp.includes('Error') && (
              <div className="bg-gray-900 border border-lime-500/30 rounded p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lime-300 text-sm mb-1">Unix Timestamp</p>
                    <p className="text-white text-lg font-mono">{timestamp}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(timestamp)}
                    className="bg-lime-500 hover:bg-lime-600 text-gray-900 px-3 py-1 rounded text-sm transition"
                  >
                    Copiar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 bg-gray-900/50 border border-lime-500/20 rounded p-4 text-sm text-lime-200">
          <p className="font-bold mb-2">💡 ¿Qué es Unix Timestamp?</p>
          <p>Es el número de segundos transcurridos desde el 1 de enero de 1970 (época Unix). Se usa comúnmente en logs de servidor, bases de datos y sistemas Unix/Linux.</p>
        </div>
      </div>
    </div>
  );
};

export default TimestampConverter;
