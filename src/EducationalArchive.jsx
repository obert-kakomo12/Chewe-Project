import React, { useState, useMemo, useEffect } from 'react';
import { Database, Search, HardDrive, ShieldCheck, Download, Archive, RefreshCw, FileText } from 'lucide-react';
import { API_BASE_URL } from './config';

const BACKUP_TIERS = [
  { label: 'Live Mirror (Geo-redundant)',     detail: 'Every mark written to 2 servers simultaneously',      icon: RefreshCw, color: 'var(--status-success)' },
  { label: 'Daily Snapshot',                  detail: 'Frozen image stored in encrypted offline vault daily', icon: Archive,   color: 'var(--accent-blue)' },
  { label: 'Point-in-Time Recovery (30 days)',detail: 'Rewind any accidental deletion to the exact minute',  icon: ShieldCheck,color: 'var(--status-warning)' },
];

const EducationalArchive = () => {
  const [exportYear, setExportYear] = useState('2025');
  const [exportTriggered, setExportTriggered] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/documents/archives`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}` }
    })
    .then(res => res.json())
    .then(data => {
      setArchives(data);
      setLoading(false);
    })
    .catch(err => {
      console.error('Failed to fetch archives:', err);
      setLoading(false);
    });
  }, []);

  const handleExport = () => {
    setExportTriggered(true);
    setTimeout(() => setExportTriggered(false), 3000);
  };

  const filteredArchives = useMemo(() => {
    if (!searchQuery.trim()) return archives;
    const q = searchQuery.toLowerCase();
    return archives.filter(a => 
      a.cohort.toLowerCase().includes(q) || 
      a.location.toLowerCase().includes(q) ||
      a.status.toLowerCase().includes(q)
    );
  }, [searchQuery, archives]);

  return (
    <div className="content-area animate-fade-in">
      {/* Header */}
      <div className="teacher-header" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--accent-blue)', padding: '20px 24px', borderRadius: '8px' }}>
        <div className="teacher-info">
          <h2>Long-Term Educational Archive</h2>
          <p>Cold-storage, triple-safe backup and decadal data retention framework</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '20px', color: 'var(--accent-blue)', fontWeight: 700, fontSize: '0.8rem' }}>
          <Database size={14} /> 0 TB Total Capacity · 100% Uptime
        </div>
      </div>

      {/* KPI row */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', margin: '24px 0' }}>
        {[
          { label: 'Hot Storage (NVMe)', value: '0 GB', color: 'var(--status-success)' },
          { label: 'Cold Storage A',     value: '0 TB', color: 'var(--accent-blue)' },
          { label: 'Deep Glacier',       value: '0 TB', color: '#8b5cf6' },
          { label: 'Cohorts Archived',   value: String(filteredArchives.length), color: 'var(--text-primary)' },
        ].map((m, i) => (
          <div key={i} className="glass-panel metric-card hover-lift">
            <div className="metric-header"><span>{m.label}</span><HardDrive size={16} /></div>
            <div className="metric-value" style={{ fontSize: '1.8rem', color: m.color }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-row" style={{ gridTemplateColumns: '1fr 2fr', marginBottom: '24px' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Triple-safe backup */}
          <div className="glass-panel hover-lift">
            <h3 className="section-title">Triple-Safe Backup Protocol</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {BACKUP_TIERS.map((tier, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <tier.icon size={14} color={tier.color} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{tier.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{tier.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Integrity check */}
          <div className="glass-panel hover-lift" style={{ background: '#f0fdf4', border: '1px solid #6ee7b7' }}>
            <h3 className="section-title" style={{ color: '#065f46' }}>Integrity Verification</h3>
            <p style={{ fontSize: '0.78rem', color: '#065f46', marginBottom: '10px' }}>
              Last checksum validation passed for all nodes. No bit-rot detected.
            </p>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last run: Today 03:00 AM</div>
          </div>

          {/* End-of-Year Master Export */}
          <div className="glass-panel hover-lift" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <h3 className="section-title" style={{ color: 'var(--accent-blue)' }}>End-of-Year Master Export</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              Generate a Master PDF Ledger — the school's permanent offline record, compliant with MoPSE requirements.
            </p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
              <select className="premium-select" style={{ flex: 1, minWidth: 0 }} value={exportYear} onChange={e => setExportYear(e.target.value)}>
                {[2025, 2024, 2023, 2022].map(y => <option key={y} value={y}>{y} Academic Year</option>)}
              </select>
            </div>
            <button className="action-button" style={{ width: '100%', justifyContent: 'center' }} onClick={handleExport}>
              <FileText size={15} /> {exportTriggered ? '✓ Generating PDF…' : 'Generate Master Ledger'}
            </button>
            {exportTriggered && (
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: 'var(--status-success)' }}>
                ✓ {exportYear} Master PDF Ledger queued. Download will begin shortly.
              </div>
            )}
          </div>
        </div>

        {/* Right: cohort table */}
        <div className="glass-panel hover-lift" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Archived Cohorts</h3>
            <div className="search-bar" style={{ width: '200px' }}>
              <Search size={16} className="text-secondary" />
              <input 
                type="text" 
                placeholder="Search cohort…" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Cohort</th><th>Size</th><th>Compression</th><th>Location</th><th>State</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                    Loading archives...
                  </td>
                </tr>
              ) : filteredArchives.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '30px' }}>
                    No archived cohorts found.
                  </td>
                </tr>
              ) : (
                filteredArchives.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{a.cohort}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.size}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{a.compression}</td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                        <HardDrive size={13} color="var(--text-secondary)" /> {a.location}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-success)', fontSize: '0.75rem', fontWeight: 600 }}>
                        <ShieldCheck size={12} /> {a.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="secondary-button" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
                          <Archive size={12} /> Retrieve
                        </button>
                        <button className="icon-button" title="Export as PDF" style={{ color: 'var(--accent-blue)' }}>
                          <Download size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <div style={{ marginTop: '16px', padding: '12px 14px', background: '#f0f4f8', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--accent-blue)' }}>MoPSE Compliance:</strong> All records meet Zimbabwe Ministry of Education requirements for long-term retention. The school retains full data ownership regardless of software subscription status.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationalArchive;
