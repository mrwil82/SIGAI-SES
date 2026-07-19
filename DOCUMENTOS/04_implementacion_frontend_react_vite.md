# DOCUMENTO 4 – Informe de implementación del frontend (React + Vite)

## 1. Objetivo y alcance
Documentar la construcción de la interfaz de usuario del sistema SES, enfocándose en la reactividad y la integración con los servicios de datos.

## 2. Inicialización del proyecto
El proyecto se inició utilizando la plantilla de Vite para React y TypeScript, garantizando un tipado fuerte y un entorno de desarrollo ágil.
```bash
npm create vite@latest Frontend -- --template react-ts
npm install axios lucide-react react-router-dom
```

## 3. Estructura de componentes
- **Fusion UI:** Sistema de diseño personalizado con componentes como `Card`, `Button`, `TableContainer` y `Badge`.
- **Layouts:** `DashboardLayout` que integra la barra lateral de navegación y el encabezado de usuario.

## 4. Configuración de rutas (React Router)
Rutas principales definidas en `App.tsx`:
- `/login`: Acceso al sistema.
- `/dashboard`: Resumen de analíticas y métricas.
- `/inventory`: Gestión de catálogo y activos serializados.
- `/guarantees`: Control de procesos RMA.

## 5. Consumo de API (Ejemplo: Inventario)
```jsx
// src/services/inventory.ts
import api from './api';

export const getInventoryItems = async () => {
  const response = await api.get('/inventory/items');
  return response.data; // Retorna lista de equipos con su stock
};

// src/pages/Inventory.tsx
useEffect(() => {
  const loadItems = async () => {
    const data = await getInventoryItems();
    setItems(data);
  };
  loadItems();
}, []);
```

## 6. Flujo de datos
El Frontend utiliza un interceptor de Axios para adjuntar automáticamente el token JWT almacenado en `localStorage` en cada petición. Los datos recibidos se almacenan en el estado de React (`useState`) para renderizar las tablas dinámicamente.

## 7. Resultado verificado
Se verificó el consumo exitoso del endpoint `/api/v1/inventory/items`, visualizando correctamente activos reales como "NVR HANWHA QRN-830S" con su ubicación física en el "ESTANTE A1", tal como se registró en la base de datos de prueba.

## 8. Conclusiones
La implementación del frontend proporciona una herramienta intuitiva y moderna que facilita el trabajo de los técnicos de SES, reemplazando con éxito la complejidad y los errores comunes de los archivos Excel manuales.
