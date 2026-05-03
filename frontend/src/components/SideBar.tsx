import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `nav-link d-flex align-items-center py-2 px-3 rounded-3 transition-all ${
      isActive ? 'active shadow-sm' : 'link-dark hover-bg-light'
    }`;

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-white border-end shadow-sm" 
         style={{ width: '260px', minHeight: 'calc(100vh - 60px)' }}>
      
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item mb-1">
          <NavLink to="/" className={navLinkClass}>
            <i className="bi bi-house-door me-3 fs-5"></i>
            <span className="fw-medium">Home</span>
          </NavLink>
        </li>

        <li className="nav-item mb-1">
          <button 
            className={`nav-link d-flex align-items-center justify-content-between w-100 py-2 px-3 rounded-3 border-0 bg-transparent ${isInventoryOpen ? 'text-primary' : 'text-dark hover-bg-light'}`}
            data-bs-toggle="collapse" 
            data-bs-target="#inventory-collapse" 
            aria-expanded={isInventoryOpen}
            onClick={() => setIsInventoryOpen(!isInventoryOpen)}
          >
            <div className="d-flex align-items-center">
              <i className="bi bi-boxes me-3 fs-5"></i>
              <span className="fw-medium">Inventory Mngt</span>
            </div>
            <i className={`bi bi-chevron-right transition-all ${isInventoryOpen ? 'rotate-90' : ''}`} style={{ fontSize: '12px' }}></i>
          </button>

          <div className={`collapse ${isInventoryOpen ? 'show' : ''} shadow-inner mt-1 rounded-3 bg-light`} id="inventory-collapse">
            <ul className="btn-toggle-nav list-unstyled fw-normal pb-1 small ps-4 ms-2 border-start">
              <li>
                <NavLink 
                    to="/item-receipt" 
                    className={navLinkClass}
                  >
                    <i className="bi bi-box-seam me-2"></i>
                    Item Receipt
                  </NavLink>
              </li>
              <li>
                <NavLink to="/receipt-history" className={navLinkClass}>
                  <i className="bi bi-clock-history me-2"></i>
                  Receipt History
                </NavLink>
              </li>

              <li>
                <NavLink to="/inventory" className={navLinkClass}>
                  <i className="bi bi-box me-2"></i>
                  Inventory Stock
                </NavLink>
              </li>
            </ul>
          </div>
        </li>
      </ul>

      <hr />
      <div className="px-2 text-center text-muted small">Version 1.0.0</div>
    </div>
  );
};

export default Sidebar;