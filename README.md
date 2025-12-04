# Calculadora de Desplazamiento — CT Montesa

Aplicación web para calcular tiempos de ruta y promedios de órdenes, optimizando los desplazamientos en el centro logístico CT Montesa.

## Funcionalidades

- Selección de destinos disponibles con información de línea y tiempo
- Construcción visual de rutas de entrega
- Asignación de órdenes por destino
- Cálculo automático de:
  - Tiempo total de desplazamiento
  - Total de órdenes
  - Promedio de tiempo por orden
- Visualización del recorrido completo

## Tecnologías

- **Frontend**: React 18 + TypeScript
- **Routing**: Wouter
- **Estilos**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Build Tool**: Vite

## Instalación Local

```bash
# Clonar el repositorio
git clone <tu-repositorio>
cd <nombre-del-proyecto>

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev:client
```

## Despliegue en Vercel

1. Sube el repositorio a GitHub
2. Ve a [vercel.com](https://vercel.com) e importa tu repositorio
3. Vercel detectará automáticamente la configuración del archivo `vercel.json`
4. Haz clic en "Deploy"

La configuración ya está lista en `vercel.json`.

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev:client` | Inicia el cliente Vite en modo desarrollo |
| `npm run dev` | Inicia el servidor completo (Replit) |
| `npm run build` | Compila el proyecto para producción |
| `npm run check` | Verifica tipos TypeScript |

## Estructura del proyecto

```
├── client/           # Aplicación React
│   ├── src/
│   │   ├── components/  # Componentes UI
│   │   ├── pages/       # Páginas de la app
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilidades
│   └── index.html
├── shared/           # Código compartido
├── vercel.json       # Configuración de Vercel
└── package.json
```

## Uso

1. **Selecciona destinos**: Pulsa en los destinos disponibles del panel izquierdo para añadirlos a tu ruta
2. **Asigna órdenes**: Introduce el número de órdenes a entregar en cada destino
3. **Calcula**: Pulsa el botón "Calcular" para obtener el tiempo total y promedio
4. **Limpiar**: Usa el botón "Limpiar" para reiniciar y crear una nueva ruta

## Licencia

MIT
