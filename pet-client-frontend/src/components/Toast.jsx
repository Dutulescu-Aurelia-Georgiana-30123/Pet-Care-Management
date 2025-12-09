export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          minWidth: 220,
          maxWidth: 360,
          padding: '10px 14px',
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 14,
          boxShadow: '0 18px 45px rgba(148, 163, 184, 0.45)',
          backgroundColor: isError ? '#fee2e2' : '#dcfce7',
          border: `1px solid ${isError ? '#fca5a5' : '#bbf7d0'}`,
          color: isError ? '#991b1b' : '#166534',
        }}
      >
        <span>{toast.message}</span>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 16,
            fontWeight: 700,
            color: 'inherit',
          }}
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
