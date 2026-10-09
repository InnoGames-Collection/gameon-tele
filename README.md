# GameOn Tele — 3D Rolling 7-Day Competition Game (Helix Jump)

Enterprise Tier-0 Telecom VAS Service featuring 3D Helix Jump physics gameplay, integrating with Ethio Telecom Shortcode `7198` (2 ETB/day) and the SP Messaging Gateway.

## Topology & Ports (`innoserver-serv001: 34.41.116.217`)
- **Player Web Client (`3600`)**: `https://gameon.innopulseplatform.com`
- **Fastify Anti-Cheat API (`3602`)**: `https://gameon-api.innopulseplatform.com`
- **Tournament Operations Console (`3603`)**: `https://gameon-admin.innopulseplatform.com`
- **PostgreSQL 16 (`5440`)**: `gameon` database
- **Valkey 8 (`6390`)**: Session, rate-limiting & OTP cache

## Directory Structure
```text
gameon-tele/
├── frontend/                     # 3D Helix Jump tournament client
├── admin/                        # Tournament operations & physics anti-cheat console
├── backend/                      # Fastify 5 REST API + 7-Day cycle engine
├── db/migrations/                # PostgreSQL schema migrations
├── deploy/nginx/                 # Host NGINX configuration
├── scripts/                      # server-deploy.sh & remote-deploy.sh
└── docker-compose.server.yml     # Complete 5-service isolated Docker stack
```
