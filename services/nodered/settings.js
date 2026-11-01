// Configuración de Node-RED para SmartRoom.
// Fuente: docs/01-arquitectura.md y docs/03-despliegue.md.
const path = require('path');

module.exports = {
  // Puerto desde entorno (Render asigna PORT).
  uiPort: process.env.PORT || 1880,

  // Directorio de flujos y credenciales dentro de la imagen.
  flowFile: 'flows.json',
  credentialsFile: 'flows_cred.json',

  // Editor de Node-RED deshabilitado en producción (nube).
  // Cuando NODERED_EDITOR_ENABLED=false, se oculta el editor y la API de administración.
  editorTheme: {
    page: {
      title: 'SmartRoom Node-RED (API solo)',
    },
    palette: {
      editable: false,
    },
    projects: {
      enabled: false,
    },
  },

  // CORS restringido al origen del frontend.
  httpNodeCors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
  },

  // Secreto de credenciales desde entorno (nunca en git).
  credentialSecret: process.env.NODERED_CREDENTIAL_SECRET || 'cambiar_en_produccion',

  // Desactivar editor en la nube si está configurado.
  // httpAdminRoot: process.env.NODERED_EDITOR_ENABLED === 'true' ? '/' : false,

  // Logging.
  logging: {
    console: {
      level: process.env.LOG_LEVEL || 'info',
      metrics: false,
      audit: false,
    },
  },

  // Directorio de nodos adicionales (si los hubiera).
  nodesDir: path.join(__dirname, 'nodes'),
};
