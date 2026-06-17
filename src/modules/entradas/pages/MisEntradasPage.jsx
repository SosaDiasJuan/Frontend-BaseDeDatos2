// Pantalla "Mis entradas" del usuario logueado.
// Orquesta: pide email del AuthContext, llama al hook, renderiza con componentes del modulo.
import { useAuth } from '../../../context/AuthContext.jsx';
import { useEntradasDeUsuario } from '../hooks/useEntradas.js';

export default function MisEntradasPage() {
  const { usuario } = useAuth();
  const email = usuario?.email;
  const { entradas, loading, error } = useEntradasDeUsuario(email);

  if (!email) return <p>Inicia sesion para ver tus entradas.</p>;
  if (loading) return <p>Cargando entradas...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (entradas.length === 0) return <p>No tenes entradas todavia.</p>;

  return (
    <ul>
      {entradas.map(e => (
        <li key={e.id}>
          Entrada #{e.id} — estado: {e.estado} — sector: {e.id_sector}
        </li>
      ))}
    </ul>
  );
}
