# F4 — Despliegue en la nube

**Estimado:** 1.5 h · **Depende de:** F2 y F3 · **Referencia:** `docs/03-despliegue.md`

## Objetivo
Tener la demo pública funcionando: HiveMQ Cloud (broker), Render (Node-RED + simulador) y Vercel (SPA).

## Tareas
- [ ] Verificar en las páginas oficiales los límites vigentes y anotar la fecha en `docs/03-despliegue.md`
- [ ] Crear clúster Serverless en HiveMQ Cloud y credenciales
- [ ] Servicio web Docker en Render apuntando a `services/nodered/`, health check `/api/health`, variables de entorno según la matriz de secretos
- [ ] Confirmar editor de Node-RED deshabilitado y CORS con el dominio de Vercel
- [ ] Proyecto en Vercel con Root Directory `services/web`, variables `VITE_*` y rewrite de SPA
- [ ] Probar el ciclo completo en la nube (comando, estado, regla R1/R2) y medir el tiempo de despertar
- [ ] Probar desde ventana privada y desde un celular
- [ ] Actualizar `docs/ESTADO.md` con las URLs públicas (sin secretos) y las decisiones tomadas

## Criterios de aceptación
- La URL de Vercel abre el dashboard; tras el banner de despertar, muestra datos vivos.
- El ciclo comando → dispositivo → estado → UI funciona en la nube.
- Ningún secreto está en el repo ni en el bundle del frontend (salvo la clave demo pública).
- Un push a `main` redepliega frontend y backend automáticamente.
