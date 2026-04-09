import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-lime-500/20 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logovapa.png" alt="VAPA" className="h-12 w-12" />
            <span className="text-2xl font-bold text-lime-400">VAPA.es</span>
          </Link>
          
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lime-300 hover:text-lime-400 transition">Inicio</Link>
            <Link to="/herramientas" className="text-lime-300 hover:text-lime-400 transition">Herramientas</Link>
            <Link to="/blog" className="text-lime-300 hover:text-lime-400 transition">Blog</Link>
            
            {user ? (
              <>
                {(user.role === 'admin' || user.role === 'editor') && (
                  <Link to="/admin" className="text-lime-300 hover:text-lime-400 transition">Admin</Link>
                )}
                <button
                  onClick={logout}
                  className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-lime-500 hover:bg-lime-600 text-gray-900 font-bold py-2 px-4 rounded transition"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
