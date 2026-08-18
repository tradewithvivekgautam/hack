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
COPY --from=dependencies /workspace/node_modules ./node_modules
COPY --from=dependencies /workspace/apps/agent/node_modules ./apps/agent/node_modules
COPY --from=dependencies /workspace/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
RUN npm run build --workspace @agentic-rwa/shared && npm run build --workspace @agentic-rwa/agent

FROM node:22.16.0-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 agent && adduser --system --uid 1001 agent
COPY --from=builder --chown=agent:agent /workspace/node_modules ./node_modules
COPY --from=builder --chown=agent:agent /workspace/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder --chown=agent:agent /workspace/packages/shared/dist ./packages/shared/dist
COPY --from=builder --chown=agent:agent /workspace/apps/agent/package.json ./apps/agent/package.json
COPY --from=builder --chown=agent:agent /workspace/apps/agent/dist ./apps/agent/dist
COPY --from=builder --chown=agent:agent /workspace/apps/agent/corpus ./apps/agent/corpus
RUN mkdir -p /app/apps/agent/.data && chown -R agent:agent /app/apps/agent/.data
USER agent
WORKDIR /app/apps/agent
CMD ["node", "dist/cli/worker.js"]
