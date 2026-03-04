import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Ticket, Shield, Database, Activity } from 'lucide-react';

function App() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetching data from your Django API on Port 8000
    axios.get('http://127.0.0.1:8000/api/tickets/')
      .then(res => {
        setTickets(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Connection Error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b', margin: 0 }}>
          <Ticket size={32} color="#2563eb" /> TicketHub React <span style={{fontSize: '12px', background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px'}}>v1.0 Live</span>
        </h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', color: '#64748b' }}>
            <Database size={16} /> PostgreSQL Connected
          </div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {loading ? (
          <p>Connecting to Backend...</p>
        ) : tickets.length > 0 ? (
          tickets.map(t => (
            <div key={t.id} style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                  {t.category || 'Support'}
                </span>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', background: t.priority === 'High' ? '#fee2e2' : '#f0fdf4', color: t.priority === 'High' ? '#991b1b' : '#166534' }}>
                  {t.priority}
                </span>
              </div>
              <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '18px' }}>{t.title}</h3>
              <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: '0 0 20px 0' }}>{t.description}</p>
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
                <Activity size={14} /> Status: <strong>{t.status}</strong>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
            <p style={{ color: '#64748b', marginBottom: '10px' }}>No tickets found in PostgreSQL.</p>
            <a href="http://127.0.0.1:8000/admin/" target="_blank" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>+ Add Ticket in Django Admin</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;