import React, { useState } from 'react';
import SubnetCalculator from '../components/tools/SubnetCalculator';
import QRGenerator from '../components/tools/QRGenerator';
import PasswordGenerator from '../components/tools/PasswordGenerator';
import Base64Converter from '../components/tools/Base64Converter';
import HashGenerator from '../components/tools/HashGenerator';
import JSONValidator from '../components/tools/JSONValidator';
import UnitConverter from '../components/tools/UnitConverter';
import UUIDGenerator from '../components/tools/UUIDGenerator';
import URLEncoder from '../components/tools/URLEncoder';
import PortAnalyzer from '../components/tools/PortAnalyzer';
import TimestampConverter from '../components/tools/TimestampConverter';
import RegexTester from '../components/tools/RegexTester';
import VLSMCalculator from '../components/tools/VLSMCalculator';
import PingTool from '../components/tools/PingTool';
import IPv4toIPv6 from '../components/tools/IPv4toIPv6';
import DNSLookup from '../components/tools/DNSLookup';

const HerramientasPage = () => {
  const [selectedTool, setSelectedTool] = useState('subnet');
  const tools = [
    { id: 'subnet', name: 'Calculadora de Subredes', icon: '📊', component: SubnetCalculator },
    { id: 'vlsm', name: 'Calculadora VLSM', icon: '🌐', component: VLSMCalculator },
    { id: 'ping', name: 'Ping', icon: '📡', component: PingTool },
    { id: 'port', name: 'Analizador de Puertos', icon: '🚪', component: PortAnalyzer },
    { id: 'ipv4to6', name: 'IPv4 a IPv6', icon: '🔄', component: IPv4toIPv6 },
    { id: 'dns', name: 'DNS Lookup', icon: '🔎', component: DNSLookup },
    { id: 'timestamp', name: 'Conversor de Timestamps', icon: '⏰', component: TimestampConverter },
    { id: 'regex', name: 'Tester de Regex', icon: '🔍', component: RegexTester },
    { id: 'qr', name: 'Generador QR', icon: '🔳', component: QRGenerator },
    { id: 'password', name: 'Generador de Contraseñas', icon: '🔑', component: PasswordGenerator },
    { id: 'base64', name: 'Convertidor Base64', icon: '🔠', component: Base64Converter },
    { id: 'hash', name: 'Generador de Hash', icon: '#️⃣', component: HashGenerator },
    { id: 'json', name: 'Validador JSON', icon: '📝', component: JSONValidator },
    { id: 'units', name: 'Convertidor de Unidades', icon: '⚖️', component: UnitConverter },
    { id: 'uuid', name: 'Generador UUID', icon: '🆔', component: UUIDGenerator },
    { id: 'url', name: 'Codificador URL', icon: '🔗', component: URLEncoder },
  ];

  const SelectedComponent = tools.find(t => t.id === selectedTool)?.component;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-lime-400 mb-2 text-center">Herramientas Técnicas</h1>
        <p className="text-center text-lime-300 mb-8">16 herramientas para profesionales IT</p>
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-4 sticky top-24">
              <h2 className="text-lime-400 font-bold mb-4">Seleccionar Herramienta</h2>
              <div className="space-y-2">
                {tools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setSelectedTool(tool.id)}
                    className={`w-full text-left px-4 py-3 rounded transition ${
                      selectedTool === tool.id
                        ? 'bg-lime-500 text-gray-900 font-bold'
                        : 'bg-gray-900/50 text-lime-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="mr-2">{tool.icon}</span>
                    {tool.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            {SelectedComponent && <SelectedComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HerramientasPage;
