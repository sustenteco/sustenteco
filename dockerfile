# Use a imagem oficial do PostgreSQL
FROM postgres:latest

# Defina as variáveis de ambiente necessárias para configurar o banco de dados
ENV POSTGRES_DB=eco_games_db
ENV POSTGRES_USER=admin
ENV POSTGRES_PASSWORD=1234

# Copie os scripts de inicialização SQL, se houver, para o diretório de inicialização do PostgreSQL
# COPY path/to/your/sql/scripts/*.sql /docker-entrypoint-initdb.d/
COPY init.sql /docker-entrypoint-initdb.d/
# Exponha a porta padrão do PostgreSQL
EXPOSE 5432
