# Bitacora de estructura del proyecto (frontend)

Este archivo documenta como esta organizado el frontend y que debe ir en cada carpeta. La arquitectura es **espejo de la del backend**: los mismos 7 dominios del obligatorio, organizados como modulos autocontenidos, con capas adaptadas a React.

Stack: React 19 + Vite. Las rutas usan `react-router-dom`, ya instalado y montado desde `App.jsx`.

## Estructura general

```
src/
├── main.jsx                      # Entry point (Vite). NO se toca.
├── App.jsx                       # Root: monta Router + Providers globales.
├── App.css / index.css           # Estilos globales.
│
├── config/
│   └── apiClient.js              # Cliente fetch unico (baseURL + token + errores).
│
├── context/
│   └── AuthContext.jsx           # Estado global: usuario logueado, rol, token.
│
├── routes/
│   ├── AppRouter.jsx             # Mapa de rutas de toda la SPA.
│   └── ProtectedRoute.jsx        # Wrapper para rutas que requieren auth/rol.
│
├── components/                   # Componentes REUTILIZABLES (no de un solo modulo).
│   ├── ui/                       # Button, Input, Modal, Card, Spinner.
│   └── layout/                   # Navbar, Sidebar, Footer.
│
├── hooks/                        # Hooks transversales (no atados a un modulo).
│
├── utils/                        # Helpers genericos (formatMonto, formatFecha).
│
└── modules/                      # Un modulo por dominio (igual que backend).
    ├── usuarios/
    ├── estadios/
    ├── eventos/
    ├── ventas/
    ├── entradas/
    ├── transferencias/
    └── validacion/
```

## Equivalencia mental con el backend

El frontend espeja al backend. Cada capa de un módulo cumple un rol equivalente:

| Backend | Frontend | Que hace |
|---|---|---|
| `repository` (SQL) | `api/` (fetch) | Habla con el "afuera" (el backend). |
| `service` (reglas) | `hooks/` | Logica, estado, side effects. |
| `controller` (HTTP) | `pages/` + `components/` | Recibe interaccion del usuario. |
| `routes` (URLs API) | `routes/AppRouter.jsx` | URLs de la SPA. |
| `middlewares` (auth/rol) | `context/AuthContext` + `ProtectedRoute` | Auth global y proteccion de rutas. |
| `config/db.js` | `config/apiClient.js` | Unico punto de salida hacia afuera. |

## `src/config/`

Aca vive el cliente HTTP unico.

`apiClient.js` envuelve `fetch` y le agrega:

- La baseURL del backend (lee `VITE_API_URL` desde `.env`; default `http://localhost:3000/api`).
- El header `Authorization: Bearer <token>` cuando el usuario esta logueado (`setAuthToken` se llama desde el AuthContext).
- Manejo uniforme de errores: si la respuesta no es 2xx, lanza un Error con `status` y mensaje.

Expone `apiClient.get`, `.post`, `.put`, `.patch`, `.delete`.

**Regla:** todos los `api/` de cada modulo importan `apiClient`. Nadie mas hace `fetch()` directo.

## `src/context/`

Estados globales que necesitan vivir por encima del Router.

`AuthContext.jsx`:

- Guarda `usuario`, `token` y `rol` del logueado.
- Persiste en `localStorage` para sobrevivir al refresh.
- Expone `login()`, `logout()`, `isAuthenticated`, `rol`.
- Sincroniza el token con `apiClient` (cuando cambia, todas las requests futuras lo llevan).

Cualquier componente lee con `const { usuario, rol, logout } = useAuth();`.

## `src/routes/`

Configuracion del routing de la SPA.

`AppRouter.jsx`: mapa de URLs -> paginas. Las rutas principales ya estan activas; mientras falten pantallas concretas, usan placeholders internos para no romper el build.

`ProtectedRoute.jsx`: wrapper para rutas privadas.

- `<ProtectedRoute>` -> requiere estar autenticado.
- `<ProtectedRoute rol="Administrador">` -> requiere ese rol especifico.

Si no se cumplen, redirige a `/login` o a `/`.

## `src/components/`

Componentes **reutilizables**, sin logica de dominio.

- `ui/`: primitivas visuales (Button, Input, Modal, Card, Spinner). Si lo usan dos modulos distintos, va aca.
- `layout/`: shell de la app (Navbar, Sidebar, Footer, AppShell).

**Regla:** si un componente solo lo usa un modulo, NO va aca; va en `modules/<modulo>/components/`.

## `src/hooks/`

Hooks **transversales**: no estan atados a ningun dominio.

Ejemplos: `useDebounce`, `useLocalStorage`, `useMediaQuery`.

Los hooks especificos de un modulo (ej: `useEntradasDeUsuario`) viven en `modules/<modulo>/hooks/`.

## `src/utils/`

Helpers puros, sin estado, sin React. Funciones simples.

Ejemplos en `format.js`: `formatMonto`, `formatFecha`, `formatFechaHora`.

## `src/modules/`

Aca vive la logica de negocio del frontend, organizada por dominio.

Cada modulo tiene esta estructura:

```
modules/<modulo>/
├── api/
│   └── <modulo>Api.js         # fetch al backend (capa de datos).
├── hooks/
│   └── use<Modulo>.js         # Estado + side effects (capa de logica).
├── components/                # Componentes JSX especificos del modulo.
│   └── <Algo>.jsx
└── pages/                     # Pantallas completas (las que monta el router).
    └── <Modulo>Page.jsx
```

### `api/<modulo>Api.js` — capa de datos

UNICA capa que llama al backend con `apiClient`.

Cada funcion del objeto exportado mapea a un endpoint del backend:

```js
export const eventosApi = {
  listar: ()       => apiClient.get('/eventos'),
  obtener: (id)    => apiClient.get(`/eventos/${id}`),
  crear: (data)    => apiClient.post('/eventos', data),
};
```

No hay estado, no hay React. Solo HTTP.

### `hooks/use<Modulo>.js` — capa de logica

Hooks que envuelven al api y exponen estado:

```js
export function useEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    eventosApi.listar()
      .then(setEventos).catch(setError).finally(() => setLoading(false));
  }, []);
  return { eventos, loading, error };
}
```

Tambien aca van las **validaciones del lado cliente** (ej: "no permitir mas de 5 entradas en el formulario") y los **calculos de UI** (ej: total con comision). El servidor sigue validando todo, pero el frontend da feedback inmediato sin esperar al request.

### `components/` — UI especifica del modulo

Componentes JSX que solo tienen sentido en este modulo (ej: `EventoCard`, `EntradaQR`, `CarritoEntradas`).

Si terminas usando un componente del modulo X en el modulo Y, **promovelo a `src/components/ui/`**.

### `pages/<Modulo>Page.jsx` — pantallas completas

Componentes "pantalla" que el router monta en una URL. Orquestan: usan hooks del modulo, arman el layout con componentes del modulo y de `src/components/`, y delegan logica.

Una pagina deberia leerse en 30-50 lineas. Si esta creciendo mas, conviene extraer componentes a `components/`.

## Comunicacion entre modulos

Cuando un modulo necesita datos de otro (ej: la pagina de comprar necesita el costo del sector), **importa el hook del otro modulo**, no el api directo.

Bien:
```js
// modules/ventas/pages/ComprarPage.jsx
import { useSectoresDeEvento } from '../../estadios/hooks/useEstadios.js';
```

Mal:
```js
// modules/ventas/pages/ComprarPage.jsx
import { estadiosApi } from '../../estadios/api/estadiosApi.js'; // saltarse el hook
```

Razon: si `estadios` decide cachear, formatear o validar algo en su hook, ventas se beneficia gratis.

## Que modulo cubre que pantalla

| Pantalla | URL sugerida | Modulo | Rol |
|---|---|---|---|
| Login | `/login` | usuarios | publico |
| Registro | `/registro` | usuarios | publico |
| Listado de eventos | `/eventos` | eventos | cualquiera autenticado |
| Detalle de evento | `/eventos/:id` | eventos | cualquiera autenticado |
| Comprar entradas | `/comprar/:idEvento` | ventas | UsuarioGen |
| Mis entradas | `/mis-entradas` | entradas | UsuarioGen |
| Mis compras | `/mis-compras` | ventas | UsuarioGen |
| Mis transferencias | `/mis-transferencias` | transferencias | UsuarioGen |
| Transferir entrada | `/transferir/:idEntrada` | transferencias | UsuarioGen |
| Admin estadios | `/admin/estadios` | estadios | Administrador |
| Admin eventos | `/admin/eventos` | eventos | Administrador |
| Validar entrada (QR) | `/validar` | validacion | Funcionario |

## Flujo concreto: comprar una entrada

1. Usuario navega a `/comprar/1`.
2. El router renderiza `ComprarPage` (de `modules/ventas/pages/`).
3. La pagina usa `useEventos` y `useSectoresDeEvento` (de los modulos eventos y estadios) para mostrar info.
4. El usuario arma su carrito; la pagina usa estado local (o un hook como `useCarritoVenta`).
5. Antes de confirmar, el hook valida en cliente: maximo 5 entradas, sectores habilitados, etc.
6. El usuario confirma; se llama a `useCrearVenta().crear({ items })`.
7. El hook llama a `ventasApi.crear(items)`.
8. `ventasApi` ejecuta `apiClient.post('/ventas', { items })`.
9. La respuesta del backend vuelve al hook, que setea estado de exito o error.
10. La pagina muestra confirmacion (o el error).

## Como agregar una pantalla nueva

Supongamos que hay que agregar el listado de transferencias recibidas:

1. En `modules/transferencias/api/transferenciasApi.js`: agregar la funcion que llama al backend.
2. En `modules/transferencias/hooks/useTransferencias.js`: agregar un hook que la consuma.
3. En `modules/transferencias/pages/`: crear `RecibidasPage.jsx` que use el hook.
4. En `routes/AppRouter.jsx`: agregar la ruta `<Route path="/transferencias/recibidas" element={<ProtectedRoute><RecibidasPage /></ProtectedRoute>} />`.

No hace falta tocar nada fuera del modulo (excepto el router).

## Como agregar un modulo nuevo

1. Crear la carpeta `src/modules/<nombre>/` con sus 4 subcarpetas: `api/`, `hooks/`, `components/`, `pages/`.
2. Crear `<nombre>Api.js`, `use<Nombre>.js`, paginas y componentes a medida que se necesiten.
3. Agregar las rutas correspondientes en `routes/AppRouter.jsx`.

## Regla de oro

- Si ves un `fetch()` fuera de un `api/`, esta mal ubicado.
- Si ves logica de negocio mezclada con markup JSX (try/catch, calculos, validaciones), esta mal: va al hook.
- Si un componente JSX tiene mas de un `useEffect`, probablemente debe ser dos componentes o un hook propio.
- Si un modulo importa el `api/` de otro modulo, esta mal: tiene que importar el `hook/`.
- Si un componente solo lo usa un modulo, NO va en `src/components/`, va en `modules/<modulo>/components/`.

Cada capa hace una sola cosa:

- **api/:** fetch al backend.
- **hooks/:** estado, side effects, validaciones de cliente, calculos de UI.
- **components/:** UI (JSX), recibe props, dispara eventos.
- **pages/:** orquesta hooks + componentes en una pantalla.
- **routes/:** URLs de la SPA.
- **context/:** estado global (auth).
- **config/:** cliente HTTP.
- **utils/:** helpers puros.
