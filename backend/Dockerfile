FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install pnpm 10
RUN npm install -g pnpm@10

# Copy package management files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install

# Copy source code and Prisma schema
COPY . .

# Generate Prisma Client and build TypeScript project
RUN pnpm prisma:generate && pnpm build

# Expose port
EXPOSE 3001

# Run database migrations and start server
CMD ["sh", "-c", "pnpm prisma:deploy && pnpm start"]
