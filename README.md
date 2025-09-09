# NestJS Docker Backend - Monorepo

A production-ready NestJS application with completely separated app and infrastructure concerns.

## Quick Start

```bash
cd infrastructure
just dev-up
```

## Structure

```
/
├── app/                    # 🎯 NestJS Application (Pure Code)
│   ├── src/               # Application source code
│   ├── package.json       # App dependencies
│   └── Dockerfile         # Multi-stage build
│
└── infrastructure/        # 🛠️ DevOps & Infrastructure (Complete)
    ├── .env.development   # Environment configurations
    ├── .env.production.example
    ├── README.md          # Infrastructure documentation  
    ├── justfile           # All deployment commands
    ├── docker/            # Docker Compose files
    ├── traefik/           # Reverse proxy config
    └── scripts/           # Setup automation
```

## Philosophy

- **App directory**: Pure application code - could be extracted to its own repository
- **Infrastructure directory**: Complete DevOps environment - could be managed by platform team
- **True separation**: Each domain is self-contained and focused

## Documentation

See `infrastructure/README.md` for complete setup instructions, available commands, and infrastructure details.

## Getting Started

All commands and documentation are in the `infrastructure/` directory:

```bash
cd infrastructure
just help  # Show all available commands
```