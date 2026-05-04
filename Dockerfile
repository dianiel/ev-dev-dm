# syntax=docker/dockerfile:1.7

FROM dhi.io/node:24-alpine3.23-dev AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

FROM dhi.io/node:24-alpine3.23-dev AS build

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM dhi.io/node:24-alpine3.23 AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/data ./data

USER node

EXPOSE 3000

CMD ["node", "server.js"]
