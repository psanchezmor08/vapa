import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <img src="/logovapa.png" alt="VAPA" className="h-32 w-32 mx-auto mb-6" />
          <h1 className="text-6xl font-bold text-lime-400 mb-6">VAPA.es</h1>
          <p className="text-2xl text-lime-300 mb-12">
            Herramientas profesionales para administradores de sistemas
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-16">
            {/* Network Calculator Card */}
            <Link
              to="/herramientas"
              className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-8 hover:border-lime-400 transition group"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-lime-400 mb-3 group-hover:text-lime-300 transition">
                NETWORK CALCULATOR
              </h3>
              <p className="text-lime-200">
                Herramienta avanzada de segmentación de redes corporativas e IPv4.
              </p>
            </Link>
            
            {/* Technical Blog Card */}
            <Link
              to="/blog"
              className="bg-gray-800/50 backdrop-blur-sm border border-lime-500/20 rounded-lg p-8 hover:border-lime-400 transition group"
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-lime-400 mb-3 group-hover:text-lime-300 transition">
                TECHNICAL BLOG
              </h3>
              <p className="text-lime-200">
                Documentación profesional sobre Cloud, Seguridad y SysAdmin.
              </p>
            </Link>
          </div>
          
          {/* Additional Tools Preview */}
          <div className="mt-16 bg-gray-800/30 backdrop-blur-sm border border-lime-500/10 rounded-lg p-6">
            <h3 className="text-xl font-bold text-lime-400 mb-4">Más Herramientas Disponibles</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="bg-gray-900/50 text-lime-300 px-4 py-2 rounded-full text-sm">Generador QR</span>
              <span className="bg-gray-900/50 text-lime-300 px-4 py-2 rounded-full text-sm">Generador de Contraseñas</span>
              <span className="bg-gray-900/50 text-lime-300 px-4 py-2 rounded-full text-sm">Convertidor Base64</span>
              <span className="bg-gray-900/50 text-lime-300 px-4 py-2 rounded-full text-sm">Generador de Hash</span>
              <span className="bg-gray-900/50 text-lime-300 px-4 py-2 rounded-full text-sm">Validador JSON</span>
              <span className="bg-gray-900/50 text-lime-300 px-4 py-2 rounded-full text-sm">Y más...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
