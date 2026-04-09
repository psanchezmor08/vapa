import React, { useState } from 'react';
import { toolsAPI } from '../../services/api';

const QRGenerator = () => {
  const [text, setText] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!text) return;
    setLoading(true);
    try {
      const data = await toolsAPI.generateQR(text);
      setQrCode(data.qr_code);
    } catch (err) {
      console.error('Error generating QR:', err);
    }
    setLoading(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'qr-code.png';
    link.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">Generador de Código QR</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-lime-300 mb-2">Texto o URL</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://vapa.es"
              rows={4}
              className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
            />
          </div>
          
          <button
            onClick={handleGenerate}
            disabled={loading || !text}
            className="w-full bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-3 px-6 rounded transition disabled:opacity-50"
          >
            {loading ? 'Generando...' : 'Generar QR'}
          </button>
        </div>

        {qrCode && (
          <div className="mt-6 text-center">
            <div className="bg-white p-4 rounded inline-block">
              <img src={qrCode} alt="QR Code" className="max-w-full" />
            </div>
            <button
              onClick={handleDownload}
              className="mt-4 bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-6 rounded transition"
            >
              Descargar QR
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;
