import React, { useState, useEffect } from 'react';

const RegexTester = () => {
  const [pattern, setPattern] = useState('');
  const [flags, setFlags] = useState({ g: true, i: false, m: false });
  const [testString, setTestString] = useState('');
  const [matches, setMatches] = useState([]);
  const [error, setError] = useState('');
  const [highlightedText, setHighlightedText] = useState('');

  const commonPatterns = [
    { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: 'URL', pattern: 'https?://[\\w.-]+\\.[a-zA-Z]{2,}[\\w./?=&-]*' },
    { name: 'IPv4', pattern: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b' },
    { name: 'Teléfono (ES)', pattern: '(?:(?:\\+|00)34)?[ -]?[6789]\\d{2}[ -]?\\d{2}[ -]?\\d{2}[ -]?\\d{2}' },
    { name: 'Fecha (DD/MM/YYYY)', pattern: '\\b\\d{2}/\\d{2}/\\d{4}\\b' },
    { name: 'Hora (HH:MM)', pattern: '\\b([01]?[0-9]|2[0-3]):[0-5][0-9]\\b' },
    { name: 'Código Postal (ES)', pattern: '\\b[0-5][0-9]{4}\\b' },
    { name: 'Hexadecimal', pattern: '#?[0-9A-Fa-f]{6}' },
  ];

  useEffect(() => {
    testRegex();
  }, [pattern, flags, testString]);

  const testRegex = () => {
    if (!pattern || !testString) {
      setMatches([]);
      setHighlightedText(testString);
      setError('');
      return;
    }

    try {
      const flagStr = Object.keys(flags).filter(k => flags[k]).join('');
      const regex = new RegExp(pattern, flagStr);
      
      if (flags.g) {
        const found = [...testString.matchAll(new RegExp(pattern, flagStr))];
        setMatches(found.map(m => ({
          match: m[0],
          index: m.index,
          groups: m.slice(1)
        })));
        
        // Highlight matches
        let highlighted = testString;
        let offset = 0;
        found.forEach(m => {
          const start = m.index + offset;
          const end = start + m[0].length;
          const before = highlighted.slice(0, start);
          const match = highlighted.slice(start, end);
          const after = highlighted.slice(end);
          highlighted = `${before}<mark class="bg-lime-400 text-gray-900 font-bold">${match}</mark>${after}`;
          offset += '<mark class="bg-lime-400 text-gray-900 font-bold"></mark>'.length;
        });
        setHighlightedText(highlighted);
      } else {
        const match = testString.match(regex);
        if (match) {
          setMatches([{
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          }]);
        } else {
          setMatches([]);
        }
      }
      
      setError('');
    } catch (err) {
      setError(err.message);
      setMatches([]);
      setHighlightedText(testString);
    }
  };

  const handleFlagChange = (flag) => {
    setFlags({ ...flags, [flag]: !flags[flag] });
  };

  const loadPattern = (patternText) => {
    setPattern(patternText);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-lime-400 mb-4">Tester de Expresiones Regulares (Regex)</h2>
        
        <div className="space-y-4">
          {/* Pattern */}
          <div>
            <label className="block text-lime-300 mb-2">Expresión Regular</label>
            <div className="flex items-center gap-2">
              <span className="text-white text-xl">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="[A-Z]\d+"
                className="flex-1 bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white font-mono focus:outline-none focus:border-lime-400"
              />
              <span className="text-white text-xl">/</span>
              {/* Flags */}
              <div className="flex gap-2">
                {['g', 'i', 'm'].map(flag => (
                  <button
                    key={flag}
                    onClick={() => handleFlagChange(flag)}
                    className={`w-8 h-8 rounded font-mono font-bold transition ${
                      flags[flag] ? 'bg-lime-500 text-gray-900' : 'bg-gray-700 text-white'
                    }`}
                  >
                    {flag}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              g = global, i = insensible a mayúsculas, m = multilínea
            </div>
          </div>

          {/* Common Patterns */}
          <div>
            <label className="block text-lime-300 mb-2">Patrones Comunes</label>
            <div className="flex flex-wrap gap-2">
              {commonPatterns.map((p) => (
                <button
                  key={p.name}
                  onClick={() => loadPattern(p.pattern)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition"
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Test String */}
          <div>
            <label className="block text-lime-300 mb-2">Texto de Prueba</label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="Escribe aquí el texto para probar la expresión regular..."
              rows={6}
              className="w-full bg-gray-900 border border-lime-500/30 rounded px-4 py-2 text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Results */}
          {!error && testString && pattern && (
            <div className="space-y-4">
              {/* Highlighted Text */}
              <div>
                <label className="block text-lime-300 mb-2">
                  Resultado ({matches.length} coincidencia{matches.length !== 1 ? 's' : ''})
                </label>
                <div 
                  className="bg-gray-900 border border-lime-500/30 rounded p-4 text-white whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                />
              </div>

              {/* Match Details */}
              {matches.length > 0 && (
                <div>
                  <label className="block text-lime-300 mb-2">Detalles de Coincidencias</label>
                  <div className="space-y-2">
                    {matches.map((m, idx) => (
                      <div key={idx} className="bg-gray-900 border border-lime-500/30 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-white font-mono">"{m.match}"</span>
                          <span className="text-lime-300 text-sm">Posición: {m.index}</span>
                        </div>
                        {m.groups.length > 0 && (
                          <div className="text-sm text-gray-400">
                            Grupos: {m.groups.map((g, i) => `$${i + 1}="${g}"`).join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 bg-gray-900/50 border border-lime-500/20 rounded p-4 text-sm text-lime-200">
          <p className="font-bold mb-2">💡 Caracteres Especiales</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><code className="bg-gray-800 px-1">\d</code> = dígito</div>
            <div><code className="bg-gray-800 px-1">\w</code> = letra/número/_</div>
            <div><code className="bg-gray-800 px-1">\s</code> = espacio</div>
            <div><code className="bg-gray-800 px-1">.</code> = cualquier carácter</div>
            <div><code className="bg-gray-800 px-1">+</code> = 1 o más</div>
            <div><code className="bg-gray-800 px-1">*</code> = 0 o más</div>
            <div><code className="bg-gray-800 px-1">?</code> = 0 o 1</div>
            <div><code className="bg-gray-800 px-1">^</code> = inicio</div>
            <div><code className="bg-gray-800 px-1">$</code> = fin</div>
            <div><code className="bg-gray-800 px-1">|</code> = o</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegexTester;
