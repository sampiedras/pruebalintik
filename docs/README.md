# Documentación — pruebalintik

Contexto, planes y skills del trabajo de la prueba técnica. Todo vive dentro del repo.

```
docs/
├── OVERVIEW.md                 # Contexto, alcance y arquitectura
├── plans/
│   ├── plan-01-setup.md        # Quasar (componentes/plugins) + router/guards + alias
│   └── plan-02-auth.md         # Login, sesión Pinia, logout (usa el guard del plan 01)
└── skills/
    └── create-vue-component/   # Cómo crear componentes Vue (+ specs)
```

La skill también está en `.cursor/skills/create-vue-component/` para que el agente de Cursor la descubra.

## Orden de ejecución

1. [Plan 01 — Setup](./plans/plan-01-setup.md)
2. [Plan 02 — Auth](./plans/plan-02-auth.md)

Cada plan tiene **criterios de aceptación**. El plan se da por cerrado cuando esa lista se cumple.

## Referencias rápidas

| Doc | Uso |
|-----|-----|
| [OVERVIEW.md](./OVERVIEW.md) | Qué hay que construir y cómo se organiza |
| [Skill create-vue-component](./skills/create-vue-component/SKILL.md) | Reglas al crear cualquier SFC |
