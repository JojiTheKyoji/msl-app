import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div style={styles.container}>
        {toasts.map((t) => (
          <div key={t.id} style={{ ...styles.toast, ...styles[t.type] }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = {
  container: {
    position: 'fixed',
    bottom: '2rem',
    right: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    zIndex: 9999,
  },
  toast: {
    padding: '0.75rem 1.25rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 500,
    maxWidth: '320px',
    animation: 'slideIn 0.2s ease',
    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
  },
  info: { background: '#1a2332', border: '1px solid #4fc3f7', color: '#e0f7fa' },
  success: { background: '#0d2318', border: '1px solid #4caf50', color: '#c8e6c9' },
  error: { background: '#2d1212', border: '1px solid #ef5350', color: '#ffcdd2' },
};
