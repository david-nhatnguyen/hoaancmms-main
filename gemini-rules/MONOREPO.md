my-cmms/
├── apps/
│   ├── api/                # NestJS Backend
│   │   ├── src/
│   │   │   ├── common/     # Decorators, Guards, Filters dùng chung
│   │   │   ├── modules/    # Domain Modules (Quan trọng)
│   │   │   │   ├── auth/
│   │   │   │   ├── assets/
│   │   │   │   │   ├── assets.resolver.ts
│   │   │   │   │   ├── assets.service.ts
│   │   │   │   │   └── assets.module.ts
│   │   │   │   └── work-orders/
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                # React Frontend
│       ├── src/
│       │   ├── components/ # Shadcn UI
│       │   ├── graphql/    # Generated hooks & types
│       │   ├── pages/
│       │   └── App.tsx
│       ├── codegen.ts      # Config generate types
│       ├── Dockerfile
│       └── package.json
│
├── packages/               # Shared logic (Optional cho MVP)
│   ├── tsconfig/
│   └── eslint-config/
│
├── docker-compose.yml      # Dev environment
├── docker-compose.prod.yml # Prod environment
└── turbo.json
