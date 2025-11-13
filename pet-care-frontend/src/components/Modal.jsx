export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(45, 219, 190, 0.28)',
      display:'grid', placeItems:'center', zIndex:9998
    }}>
      <div style={{ background:'#ab9ac0ff', borderRadius:16, padding:20, width:'min(520px, 92vw)', boxShadow:'0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <h3 style={{ margin:0 }}>{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
