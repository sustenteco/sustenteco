CREATE TABLE "User" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Ecopuzzle" (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tempo_record INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_id_usuario FOREIGN KEY (id_usuario) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE "Crossworld" (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tempo_record INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_id_usuario FOREIGN KEY (id_usuario) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE "Quiz" (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tempo_record INT NOT NULL,
    quantidade_erros INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_id_usuario FOREIGN KEY (id_usuario) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE "Hangame" (
    id SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    tempo_record INT NOT NULL,
    quantidade_erros INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_id_usuario FOREIGN KEY (id_usuario) REFERENCES "User"(id) ON DELETE CASCADE
);
