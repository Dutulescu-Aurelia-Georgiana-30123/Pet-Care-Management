// src/components/Toast.jsx
import { useEffect, useState } from 'react';

let pushToast;
export function toast(msg, type='info') {
  if (pushToast) pushToast({ id: Date.now(), msg, type });
}

export default function ToastContainer() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    pushToast = (t) => {
      setItems(prev => [...prev, t]);
      setTimeout(() => {
        setItems(prev => prev.filter(x => x.id !== t.id));
      }, 2500);
    };
    return () => { pushToast = undefined; };
  }, []);

  return (
    <div style={{ position:'fixed', right:16, top:16, display:'grid', gap:8, zIndex:9999 }}>
      {items.map(t => (
        <div key={t.id} style={{
          background: t.type==='error' ? '#fee2e2' : '#ecfdf5',
          color:      t.type==='error' ? '#991b1b' : '#065f46',
          border:'1px solid rgba(0,0,0,.08)', padding:'10px 14px',
          borderRadius:10, boxShadow:'0 8px 24px rgba(0,0,0,.08)'
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
