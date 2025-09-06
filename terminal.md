Initializing deployment
Clonning Repo github.com/jhefinfulll/valelocal.git to /etc/dokploy/applications/valelocal-sistema-tld9v5/code: ✅
Cloning into '/etc/dokploy/applications/valelocal-sistema-tld9v5/code'...
remote: Enumerating objects: 298, done.
Cloned github.com/jhefinfulll/valelocal.git: ✅
Build nixpacks: ✅
Source Type: github: ✅
╔════════════ Nixpacks v1.39.0 ════════════╗
║ setup      │ nodejs_18, npm-9_x, openssl ║
║──────────────────────────────────────────║
║ install    │ npm ci                      ║
║──────────────────────────────────────────║
║ build      │ npm run build               ║
║──────────────────────────────────────────║
║ start      │ npm run start               ║
╚══════════════════════════════════════════╝
#0 building with "default" instance using docker driver
#1 [internal] load build definition from Dockerfile
#1 transferring dockerfile: 1.73kB done
#1 DONE 0.0s
#2 [internal] load metadata for ghcr.io/railwayapp/nixpacks:ubuntu-1745885067
#2 DONE 0.3s
#3 [internal] load .dockerignore
#3 transferring context: 2B done
#3 DONE 0.0s
#4 [stage-0  1/10] FROM ghcr.io/railwayapp/nixpacks:ubuntu-1745885067@sha256:d45c89d80e13d7ad0fd555b5130f22a866d9dd10e861f589932303ef2314c7de
#4 DONE 0.0s
#5 [internal] load build context
#5 transferring context: 109.74MB 1.1s done
#5 DONE 1.1s
#6 [stage-0  2/10] WORKDIR /app/
#6 CACHED
#7 [stage-0  3/10] COPY .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix
#7 CACHED
#8 [stage-0  4/10] RUN nix-env -if .nixpacks/nixpkgs-ffeebf0acf3ae8b29f8c7049cd911b9636efd7e7.nix && nix-collect-garbage -d
#8 CACHED
#9 [stage-0  5/10] COPY . /app/.
#9 DONE 0.5s
#10 [stage-0  6/10] RUN --mount=type=cache,id=bkQ14cKChSk-/root/npm,target=/root/.npm npm ci
#10 0.821 npm warn config production Use `--omit=dev` instead.
#10 3.087 npm warn ERESOLVE overriding peer dependency
#10 3.088 npm warn While resolving: react-copy-to-clipboard@5.1.0
#10 3.088 npm warn Found: react@19.1.0
#10 3.088 npm warn node_modules/react
#10 3.088 npm warn   react@"19.1.0" from the root project
#10 3.088 npm warn   9 more (next, react-dom, react-icons, ...)
#10 3.088 npm warn
#10 3.088 npm warn Could not resolve dependency:
#10 3.088 npm warn peer react@"^15.3.0 || 16 || 17 || 18" from react-copy-to-clipboard@5.1.0
#10 3.088 npm warn node_modules/swagger-ui-react/node_modules/react-copy-to-clipboard
#10 3.088 npm warn   react-copy-to-clipboard@"5.1.0" from swagger-ui-react@5.28.1
#10 3.088 npm warn   node_modules/swagger-ui-react
#10 3.088 npm warn
#10 3.088 npm warn Conflicting peer dependency: react@18.3.1
#10 3.088 npm warn node_modules/react
#10 3.088 npm warn   peer react@"^15.3.0 || 16 || 17 || 18" from react-copy-to-clipboard@5.1.0
#10 3.088 npm warn   node_modules/swagger-ui-react/node_modules/react-copy-to-clipboard
#10 3.088 npm warn     react-copy-to-clipboard@"5.1.0" from swagger-ui-react@5.28.1
#10 3.088 npm warn     node_modules/swagger-ui-react
#10 3.093 npm warn ERESOLVE overriding peer dependency
#10 3.093 npm warn While resolving: react-debounce-input@3.3.0
#10 3.093 npm warn Found: react@19.1.0
#10 3.093 npm warn node_modules/react
#10 3.093 npm warn   react@"19.1.0" from the root project
#10 3.093 npm warn   9 more (next, react-dom, react-icons, ...)
#10 3.093 npm warn
#10 3.093 npm warn Could not resolve dependency:
#10 3.093 npm warn peer react@"^15.3.0 || 16 || 17 || 18" from react-debounce-input@3.3.0
#10 3.093 npm warn node_modules/swagger-ui-react/node_modules/react-debounce-input
#10 3.093 npm warn   react-debounce-input@"=3.3.0" from swagger-ui-react@5.28.1
#10 3.093 npm warn   node_modules/swagger-ui-react
#10 3.093 npm warn
#10 3.093 npm warn Conflicting peer dependency: react@18.3.1
#10 3.093 npm warn node_modules/react
#10 3.093 npm warn   peer react@"^15.3.0 || 16 || 17 || 18" from react-debounce-input@3.3.0
#10 3.093 npm warn   node_modules/swagger-ui-react/node_modules/react-debounce-input
#10 3.093 npm warn     react-debounce-input@"=3.3.0" from swagger-ui-react@5.28.1
#10 3.093 npm warn     node_modules/swagger-ui-react
#10 3.264 npm warn ERESOLVE overriding peer dependency
#10 3.264 npm warn While resolving: react-inspector@6.0.2
#10 3.264 npm warn Found: react@19.1.0
#10 3.264 npm warn node_modules/react
#10 3.264 npm warn   react@"19.1.0" from the root project
#10 3.264 npm warn   9 more (next, react-dom, react-icons, ...)
#10 3.264 npm warn
#10 3.264 npm warn Could not resolve dependency:
#10 3.264 npm warn peer react@"^16.8.4 || ^17.0.0 || ^18.0.0" from react-inspector@6.0.2
#10 3.264 npm warn node_modules/swagger-ui-react/node_modules/react-inspector
#10 3.264 npm warn   react-inspector@"^6.0.1" from swagger-ui-react@5.28.1
#10 3.264 npm warn   node_modules/swagger-ui-react
#10 3.264 npm warn
#10 3.264 npm warn Conflicting peer dependency: react@18.3.1
#10 3.264 npm warn node_modules/react
#10 3.264 npm warn   peer react@"^16.8.4 || ^17.0.0 || ^18.0.0" from react-inspector@6.0.2
#10 3.264 npm warn   node_modules/swagger-ui-react/node_modules/react-inspector
#10 3.264 npm warn     react-inspector@"^6.0.1" from swagger-ui-react@5.28.1
#10 3.264 npm warn     node_modules/swagger-ui-react
#10 14.07 npm warn deprecated inflight@1.0.6: This module is not supported, and leaks memory. Do not use it. Check out lru-cache if you want a good and tested way to coalesce async requests by a key value, which is much more comprehensive and powerful.
#10 14.15 npm warn deprecated lodash.get@4.4.2: This package is deprecated. Use the optional chaining (?.) operator instead.
#10 14.26 npm warn deprecated lodash.isequal@4.5.0: This package is deprecated. Use require('node:util').isDeepStrictEqual instead.
#10 14.54 npm warn deprecated glob@7.1.6: Glob versions prior to v9 are no longer supported
#10 15.41 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
#10 39.73
#10 39.73 added 594 packages, and audited 595 packages in 39s
#10 39.73
#10 39.73 179 packages are looking for funding
#10 39.73   run `npm fund` for details
#10 39.75
#10 39.75 5 moderate severity vulnerabilities
#10 39.75
#10 39.75 To address all issues (including breaking changes), run:
#10 39.75   npm audit fix --force
#10 39.75
#10 39.75 Run `npm audit` for details.
#10 DONE 40.9s
#11 [stage-0  7/10] COPY . /app/.
#11 DONE 0.3s
#12 [stage-0  8/10] RUN --mount=type=cache,id=bkQ14cKChSk-next/cache,target=/app/.next/cache --mount=type=cache,id=bkQ14cKChSk-node_modules/cache,target=/app/node_modules/.cache npm run build
#12 0.768 npm warn config production Use `--omit=dev` instead.
#12 0.828
#12 0.828 > vale-local@0.1.0 build
#12 0.828 > prisma generate && SKIP_ENV_VALIDATION=true next build
#12 0.828
#12 2.608 warn The configuration property `package.json#prisma` is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., `prisma.config.ts`).
#12 2.608 For more information, see: https://pris.ly/prisma-config
#12 2.608
#12 2.981 Prisma schema loaded from prisma/schema.prisma
#12 3.930
#12 3.930 ✔ Generated Prisma Client (v6.15.0) to ./src/generated/prisma in 447ms
#12 3.930
#12 3.930 Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
#12 3.930
#12 3.930 Tip: Want to turn off tips and other hints? https://pris.ly/tip-4-nohints
#12 3.930
#12 5.665    ▲ Next.js 15.5.2
#12 5.665
#12 5.742    Creating an optimized production build ...
#12 57.67  ✓ Compiled successfully in 52s
#12 57.68    Skipping validation of types
#12 57.68    Skipping linting
#12 58.21    Collecting page data ...
#12 59.70 🔧 getAsaasConfig(): {
#12 59.70   hasApiKey: true,
#12 59.70   apiKeyPreview: 'sua_chave_asaas_aqui...',
#12 59.70   isSandbox: true,
#12 59.70   envVars: [ 'ASAAS_API_KEY', 'ASAAS_SANDBOX', 'ASAAS_WEBHOOK_SECRET' ]
#12 59.70 }
#12 59.70 🔧 AsaasService constructor - configurado: {
#12 59.70   baseURL: 'https://sandbox.asaas.com/api/v3',
#12 59.70   hasApiKey: true,
#12 59.70   apiKeyPreview: 'sua_chave_...'
#12 59.70 }
#12 59.83 🔧 getAsaasConfig(): {
#12 59.83   hasApiKey: true,
#12 59.83   apiKeyPreview: 'sua_chave_asaas_aqui...',
#12 59.83   isSandbox: true,
#12 59.83   envVars: [ 'ASAAS_API_KEY', 'ASAAS_SANDBOX', 'ASAAS_WEBHOOK_SECRET' ]
#12 59.83 }
#12 59.83 🔧 AsaasService constructor - configurado: {
#12 59.83   baseURL: 'https://sandbox.asaas.com/api/v3',
#12 59.83   hasApiKey: true,
#12 59.83   apiKeyPreview: 'sua_chave_...'
#12 59.83 }
#12 59.87 Error: @prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.
#12 59.87     at 47473 (.next/server/app/api/estabelecimentos/[id]/user/reset-password/route.js:1:1183)
#12 59.87     at c (.next/server/webpack-runtime.js:1:143)
#12 59.87     at <unknown> (.next/server/app/api/estabelecimentos/[id]/user/reset-password/route.js:1:8489)
#12 59.87     at c.X (.next/server/webpack-runtime.js:1:1514)
#12 59.87     at <unknown> (.next/server/app/api/estabelecimentos/[id]/user/reset-password/route.js:1:8459)
#12 59.87     at Object.<anonymous> (.next/server/app/api/estabelecimentos/[id]/user/reset-password/route.js:1:8521)
#12 59.87
#12 59.90 > Build error occurred
#12 59.92 [Error: Failed to collect page data for /api/estabelecimentos/[id]/user/reset-password] {
#12 59.92   type: 'Error'
#12 59.92 }
#12 ERROR: process "/bin/bash -ol pipefail -c npm run build" did not complete successfully: exit code: 1
------
> [stage-0  8/10] RUN --mount=type=cache,id=bkQ14cKChSk-next/cache,target=/app/.next/cache --mount=type=cache,id=bkQ14cKChSk-node_modules/cache,target=/app/node_modules/.cache npm run build:
59.87     at c (.next/server/webpack-runtime.js:1:143)
59.87     at <unknown> (.next/server/app/api/estabelecimentos/[id]/user/reset-password/route.js:1:8489)
59.87     at c.X (.next/server/webpack-runtime.js:1:1514)
59.87     at <unknown> (.next/server/app/api/estabelecimentos/[id]/user/reset-password/route.js:1:8459)
59.87     at Object.<anonymous> (.next/server/app/api/estabelecimentos/[id]/user/reset-password/route.js:1:8521)
59.87
59.90 > Build error occurred
59.92 [Error: Failed to collect page data for /api/estabelecimentos/[id]/user/reset-password] {
59.92   type: 'Error'
59.92 }
------
9 warnings found (use docker --debug to expand):
 - SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ARG "ASAAS_API_KEY") (line 11)
- SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ARG "ASAAS_WEBHOOK_SECRET") (line 11)
- SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ENV "JWT_SECRET") (line 12)
- SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ENV "NEXTAUTH_SECRET") (line 12)
- UndefinedVar: Usage of undefined variable '$NIXPACKS_PATH' (line 18)
- SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ARG "JWT_SECRET") (line 11)
- SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ARG "NEXTAUTH_SECRET") (line 11)
- SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ENV "ASAAS_API_KEY") (line 12)
- SecretsUsedInArgOrEnv: Do not use ARG or ENV instructions for sensitive data (ENV "ASAAS_WEBHOOK_SECRET") (line 12)
Dockerfile:24
--------------------
|     # build phase
|     COPY . /app/.
| >>> RUN --mount=type=cache,id=bkQ14cKChSk-next/cache,target=/app/.next/cache --mount=type=cache,id=bkQ14cKChSk-node_modules/cache,target=/app/node_modules/.cache npm run build
|
|
--------------------
ERROR: failed to build: failed to solve: process "/bin/bash -ol pipefail -c npm run build" did not complete successfully: exit code: 1
Error: Docker build failed
Error response from daemon: No such container: valelocal-sistema-tld9v5-X_LtOD1-Nk
Error ❌
Error response from daemon: No such container: valelocal-sistema-tld9v5-X_LtOD1-Nk