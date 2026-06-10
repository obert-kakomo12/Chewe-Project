import React from 'react';
import { Database, Archive, Search, HardDrive, Server, ShieldCheck } from 'lucide-react';

const mockArchives = [
  { cohort: 'Class of 2025', size: '4.2 GB', compression: 'GZIP L9', location: 'Cold Storage A', status: 'Immutable' },
  { cohort: 'Class of 2024', size: '3.8 GB', compression: 'GZIP L9', location: 'Cold Storage A', status: 'Immutable' },
  { cohort: 'Class of 2023', size: '4.0 GB', compression: 'GZIP L9', location: 'Deep Glacier', status: 'Immutable' },
];

const EducationalArchive = () => {
  return (
    <div className="content-area animate-fade-in">
      <div className="teacher-header" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-blue)', padding: '24px', borderRadius: '4px' }}>
        <div className="teacher-info">
          <h2>Long-Term Educational Archive</h2>
          <p>Cold-storage and redundant digital preservation framework for data permanence.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '20px', color: 'var(--accent-blue)', fontWeight: 600 }}>
          <Database size={16} /> Storage: 12 TB Total
        </div>
      </div>

      <div className="dashboard-row" style={{ gridTemplateColumns: '1fr 2fr' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel hover-lift">
            <h3 className="section-title">
              Storage Nodes
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Hot Storage (NVMe)</span>
                <span style={{ fontWeight: 'bold' }}>840 GB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Cold Storage A</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-blue)' }}>2.4 TB</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Deep Glacier</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-purple)' }}>8.7 TB</span>
              </div>
            </div>
          </div>

          <div className="glass-panel hover-lift" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <h3 className="section-title" style={{ color: 'var(--status-success)' }}>
              Integrity Verification
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Last checksum validation passed for all cold storage nodes. No bit-rot detected.
            </p>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Last run: Today 03:00 AM</div>
          </div>
        </div>

        <div className="glass-panel hover-lift" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Archived Cohorts</h3>
            <div className="search-bar" style={{ width: '200px' }}>
              <Search size={18} className="text-secondary" />
              <input type="text" placeholder="Search Cohort..." />
            </div>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Cohort Identifier</th>
                <th>Data Size</th>
                <th>Compression</th>
                <th>Storage Location</th>
                <th>State</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mockArchives.map((archive, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 500 }}>{archive.cohort}</td>
                  <td>{archive.size}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{archive.compression}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HardDrive size={14} className="text-secondary" /> {archive.location}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-success)', fontSize: '0.75rem' }}>
                      <ShieldCheck size={12} /> {archive.status}
                    </span>
                  </td>
                  <td>
                    <button className="secondary-button" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>Request Retrieval</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EducationalArchive;
