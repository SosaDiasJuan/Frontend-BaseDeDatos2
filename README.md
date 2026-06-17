# Frontend-BaseDeDatos2

Aplicación frontend construida con Vite y React para el proyecto obligatorio de Base de Datos. Esta carpeta contiene la aplicación de cliente que se despliega durante el desarrollo y la producción.

## Requisitos

- Node.js 18 o superior
- npm 10 o superior

## Instalación

```bash
npm install
```

## Uso

### Desarrollo

Inicia el servidor de desarrollo con hot reload:

```bash
npm run dev
```

### Build de producción

Genera los archivos optimizados para producción en `dist`:

```bash
npm run build
```

### Previsualizar production

Muestra una versión local del build de producción:

```bash
npm run preview
```

### Linter

Ejecuta ESLint para verificar la calidad del código:

```bash
npm run lint
```

## Estructura del proyecto

- `src/main.jsx` - punto de entrada de la aplicación.
- `src/App.jsx` - componente principal de React.
- `src/index.css` - estilos globales.
- `src/App.css` - estilos del componente principal.
- `index.html` - plantilla HTML usada por Vite.
- `vite.config.js` - configuración del bundler Vite.
- `eslint.config.js` - reglas y configuración de ESLint.

## Dependencias principales

- `react` - biblioteca para construir la interfaz.
- `react-dom` - renderizado en el navegador.
- `vite` - bundler y servidor de desarrollo.
- `@vitejs/plugin-react` - soporte React en Vite.

## Notas

- Este repositorio está configurado como `private` en `package.json`, por lo que no se publica en npm.
- Ajusta la configuración de ESLint y Vite según las necesidades del proyecto.
