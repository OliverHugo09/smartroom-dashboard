# Configuración de Claude Code

> Verificar el formato vigente en la documentación oficial de Claude Code antes de crear estos archivos.

## Memoria
`CLAUDE.md` en la raíz (ya existe). Mantenerlo corto; el detalle vive en `docs/`.

## Skills propias (`.claude/skills/<nombre>/SKILL.md`)
| Skill | Para qué |
|---|---|
| `mqtt-contract` | Mantener topics y payloads de `docs/01-arquitectura.md`; ejemplos válidos e inválidos |
| `nodered-conventions` | Un tab por responsabilidad, nombres de nodos, nodos catch, cómo exportar `flows.json` sin credenciales |
| `free-tier-check` | No suponer límites de planes gratuitos: consultar la página oficial y anotar fecha en `docs/03-despliegue.md` |

## Subagentes (`.claude/agents/<nombre>.md`)
| Subagente | Rol |
|---|---|
| `tester` | Escribe y corre pruebas del simulador y el smoke e2e; reporta fallos |
| `reviewer` | Revisa diffs contra contratos y reglas de seguridad, sin editar |

## Hooks
- Tras editar: lint y pruebas rápidas del servicio tocado.
- Bloquear commit de `.env*` reales y de `flows_cred.json`.
- Al cerrar sesión: recordar actualizar `docs/ESTADO.md`.

## MCP
GitHub (Issues y PRs). Opcional: ninguno más; el proyecto es pequeño.

## Git
- Ramas `feat/fx-descripcion`; commits en inglés con Conventional Commits (`feat(nodered): add vacancy rule`).
- Un Issue por fase con checklist de criterios; commits o PRs con `Closes #n`.
- GitHub Projects con columnas Backlog / En curso / Hecho.

## Cómo pedir trabajo
Una fase por sesión. Ejemplo: "Lee `docs/ESTADO.md` y `docs/fases/F1-simulador.md`, propón el plan y espera mi OK". Al terminar: "Verifica criterios de F1, actualiza `ESTADO.md` y prepara el commit".
