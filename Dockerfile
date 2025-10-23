# ---------------------------------------------------------------
# 🧱 ESTÁGIO 1 — BUILD
# Responsável por instalar dependências e compilar o TypeScript
# ---------------------------------------------------------------
FROM node:22-alpine AS build

# Define o diretório de trabalho no container
WORKDIR /usr/src/app

# Habilita o Corepack e ativa a mesma versão do pnpm usada no projeto
# (importante para builds reprodutíveis)
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# Copia apenas arquivos necessários para instalar dependências
# Isso mantém o cache do Docker mais eficiente
COPY package.json pnpm-lock.yaml ./

# Instala TODAS as dependências (incluindo dev)
RUN pnpm install --frozen-lockfile

# Copia o restante dos arquivos do projeto
# (só depois da instalação das dependências)
COPY tsconfig.json ./
COPY src ./src

# Compila o TypeScript (gera dist/)
RUN pnpm run build


# ---------------------------------------------------------------
# 🚀 ESTÁGIO 2 — PRODUÇÃO
# Cria uma imagem final mínima e pronta para rodar
# ---------------------------------------------------------------
FROM node:22-alpine AS production

# Define a variável de ambiente para otimizar performance
ENV NODE_ENV=production

# Define o diretório de trabalho
WORKDIR /usr/src/app

# Habilita novamente o Corepack e ativa o pnpm
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# Copia apenas o package.json e lockfile
# (para instalar somente as dependências de produção)
COPY package.json pnpm-lock.yaml ./

# Instala APENAS dependências necessárias em produção
RUN pnpm install --prod --frozen-lockfile

# Copia o build gerado no estágio anterior
COPY --from=build /usr/src/app/dist ./dist

# Expõe a porta usada pelo servidor Express
EXPOSE 3000

# Comando padrão para iniciar a aplicação
# (usa o script "start" do package.json → node dist/server.js)
CMD [ "pnpm", "start" ]
