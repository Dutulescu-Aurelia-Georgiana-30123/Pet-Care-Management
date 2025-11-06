
import { useEffect, useState } from 'react';
import Owners from '../services/owners.js'; // <— import DEFAULT (fără acolade)

export default function OwnersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await Owners.list();   // cheamă GET /api/owners
        setRows(Array.isArray(data) ? data : []);
        console.log('Owners from API:', data); // doar ca debug
      } catch (e) {
        console.error(e);
        setError('Nu am putut încărca owners. Vezi consola.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <section className="p-4 text-left">
      <h2 className="text-2xl font-bold mb-4">👤 Owners</h2>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}

      {!loading && !error && (
        <>
          <p className="opacity-70 mb-4">Am încărcat {rows.length} owner(s).</p>

          <div className="grid gap-3">
            {rows.map(o => (
              <div key={o.id} className="border rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <div className="font-bold">{o.name}</div>
                  <div>{o.email} {o.phone && <span className="opacity-80">• {o.phone}</span>}</div>
                  <div className="text-sm opacity-70">
                    Pets: {o.pets?.length ? o.pets.join(', ') : '—'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}


