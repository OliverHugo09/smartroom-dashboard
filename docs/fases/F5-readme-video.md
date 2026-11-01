# F5 — README, video y cierre

**Estimado:** 1 h · **Depende de:** F4

## Objetivo
Que quien reciba el link entienda el proyecto en 2 minutos, lo vea funcionar aunque un servicio gratuito falle ese día, y sepa exactamente qué es real y qué es simulado.

## Contenido del README (para humanos, en español)
1. Título, frase de una línea y botones/enlaces: **Demo en vivo**, video, arquitectura.
2. Qué hace y por qué (contexto hotelero).
3. Diagrama de arquitectura (Mermaid) y flujo de un comando.
4. Stack y decisiones técnicas (retained MQTT en lugar de BD, un contenedor con dos procesos, WebSocket + ping para planes gratuitos).
5. Cómo correrlo en local (`docker compose up`, variables de ejemplo).
6. Capturas y GIF/video de 60–90 s: cambio de escena, regla de ahorro al vaciar la suite, reconexión.
7. **Limitaciones conocidas:** datos simulados; no hay integración real con Lutron; servicios gratuitos que tardan ~1 min en despertar; sin autenticación de usuarios.
8. Próximos pasos: adaptador a una interfaz real de integración documentada por el fabricante, historial en base de datos, autenticación, pruebas e2e en CI, notificaciones por webhook.
9. Cómo se construyó con Claude Code (skills, subagentes, qué decidí yo y cómo verifiqué).

## Tareas
- [ ] Redactar README según la lista
- [ ] Grabar el video/GIF (local y nube) y subirlo al repo o a un enlace estable
- [ ] Revisar que no se afirme integración real con Lutron
- [ ] Ejecutar el checklist de `docs/03-despliegue.md`
- [ ] Fijar el repo como destacado en el perfil de GitHub y verificar el enlace del CV

## Criterios de aceptación
- El README se entiende sin abrir otro archivo.
- Los enlaces de demo, video y repositorio funcionan el día del envío.
- La sección de limitaciones es explícita y honesta.
