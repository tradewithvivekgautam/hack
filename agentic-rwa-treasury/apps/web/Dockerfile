# syntax=docker/dockerfile:1.7
FROM node:22.16.0-alpine AS dependencies
WORKDIR /workspace
COPY package.json .npmrc ./
COPY apps/web/package.json apps/web/package.json
COPY apps/agent/package.json apps/agent/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY contracts/package.json contracts/package.json
RUN npm install --ignore-scripts

FROM node:22.16.0-alpine AS builder
WORKDIR /workspace
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /workspace/node_modules ./node_modules
COPY --from=dependencies /workspace/apps/web/node_modules ./apps/web/node_modules
COPY --from=dependencies /workspace/apps/agent/node_modules ./apps/agent/node_modules
COPY --from=dependencies /workspace/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=dependencies /workspace/contracts/node_modules ./contracts/node_modules
COPY . .
RUN npm run build --workspace @agentic-rwa/shared && npm run build --workspace @agentic-rwa/web

FROM node:22.16.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /workspace/apps/web/public ./apps/web/public
USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
