import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FaHome, FaClipboardList, FaBars } from 'react-icons/fa';
import logo from './logo.png';
import './layout.css';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [targetTab, setTargetTab] = useState(null);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/whoqol') return 'whoqol';
    if (path === '/q8rn') return 'q8rn';
    return 'home';
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleNavigation = (tab) => {
    if (hasUnsavedChanges && location.pathname !== tab) {
      setTargetTab(tab);
      setShowConfirmation(true);
    } else {
      navigate(tab);
    }
  };

  const confirmNavigation = () => {
    setShowConfirmation(false);
    setHasUnsavedChanges(false);
    navigate(targetTab);
  };

  const cancelNavigation = () => {
    setShowConfirmation(false);
    setTargetTab(null);
  };

  return (
    <div className="app-container">
      <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <button className="hamburger-btn" onClick={toggleSidebar}>
            <FaBars />
          </button>
          {!collapsed && <img src={logo} alt="Logo" className="logo" />}
        </div>

        <ul className="nav-menu">
          <li
            className={`nav-item ${getActiveTab() === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigation('/')}
          >
            <span className="icon"><FaHome /></span>
            {!collapsed && <span className="text">Home</span>}
          </li>
          <li
            className={`nav-item ${getActiveTab() === 'whoqol' ? 'active' : ''}`}
            onClick={() => handleNavigation('/whoqol')}
          >
            <span className="icon"><FaClipboardList /></span>
            {!collapsed && <span className="text">Qualidade de Vida</span>}
          </li>
          <li
            className={`nav-item ${getActiveTab() === 'q8rn' ? 'active' : ''}`}
            onClick={() => handleNavigation('/q8rn')}
          >
            <span className="icon"><FaClipboardList /></span>
            {!collapsed && <span className="text">Estilo de Vida</span>}
          </li>
        </ul>
      </div>

      <div className={`main-content ${collapsed ? 'collapsed' : ''}`}>
        <Outlet context={{ setHasUnsavedChanges }} />
      </div>

      {showConfirmation && (
        <div className="confirmation-modal">
          <div className="modal-content">
            <h3>Atenção</h3>
            <p>Ao mudar de questionário, todo o progresso não salvo será perdido. Deseja continuar?</p>
            <div className="modal-buttons">
              <button
                className="modal-button modal-button-cancel"
                onClick={cancelNavigation}
              >
                Cancelar
              </button>
              <button
                className="modal-button modal-button-confirm"
                onClick={confirmNavigation}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
