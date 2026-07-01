# JavaBase

**Plataforma interativa de Fundamentos Java & Software Engineering.**

Cada tópico tem explicação, código executável (com syntax highlight) e quiz. Mas o diferencial não é o conteúdo — é que **o backend usa os mesmos padrões que o conteúdo ensina**. A seção sobre `@Cacheable`? O `TopicService` deste próprio servidor usa `@Cacheable`. Você pode inclusive ler o `.java` real através do site (`/codigo-fonte`).

> Projeto de estudo e portfólio — Java 21 + Spring Boot 3.4 no backend, React 18 + TypeScript no frontend.

---

## Como rodar

Pré-requisitos: Docker, JDK 21, Node 20+.

```bash
# 1. Sobe o Postgres
docker compose up -d

# 2. Backend (porta 8080)
cd backend
./mvnw spring-boot:run

# 3. Frontend (porta 5173), em outro terminal
cd javabase-frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. O `DataSeeder` popula o banco automaticamente no primeiro start (45 tópicos, 135 quizzes) — só roda se a tabela `topic` estiver vazia.

Documentação interativa da API: `http://localhost:8080/swagger-ui.html`.

---

## Trilhas

O conteúdo é organizado em 3 trilhas de progressão (puramente uma divisão de apresentação no frontend — `Category` já basta pro backend, a trilha é derivada dela em `types/index.ts`, sem duplicar dado):

| Trilha | Categorias | Foco |
|---|---|---|
| **Java Básico** | Fundamentos, OOP, Armadilhas Clássicas, Collections, Exceptions | Sintaxe, pilares de OOP, armadilhas clássicas (`==` vs `.equals()`, N+1 conceitual) |
| **Java Intermediário** | Java Moderno, Ecossistema, Spring Boot, HTTP & REST, SQL | Records/sealed/pattern matching, Git/Maven, arquitetura Spring, REST, SQL básico |
| **Engenharia de Software** | Concorrência, Microservices, Performance | JVM memory model, thread-safety, self-invocation, arquitetura distribuída, tuning de performance — conteúdo de preparação para entrevistas de backend enterprise |

A trilha "Engenharia de Software" é conceitual: o JavaBase em si é (e deve ser) um monólito simples — não há Kafka, Redis ou Resilience4j de verdade rodando aqui. O que é real e cacheado nesta trilha é a ligação de volta pro próprio código: o tópico sobre self-invocation em `@Transactional`, por exemplo, aponta pro [`ProgressService.java`](backend/src/main/java/com/javabase/service/ProgressService.java), que usa `@Transactional` de verdade nos métodos `marcarComoCompleto` e `submeterQuiz`.

---

## Arquitetura: meta-referencial

O projeto se propõe a ser o próprio exemplo do que ensina:

- A seção sobre **Injeção de Dependência** explica constructor injection — e todo `@Service`/`@RestController` do backend usa constructor injection (sem `@Autowired` em field).
- A seção sobre **`@Cacheable`** explica cache com Caffeine — e `TopicService.listarAgrupados()` usa exatamente essa anotação, com TTL de 10 minutos.
- A seção sobre **`@RestControllerAdvice`** explica tratamento de erro centralizado — e é assim que todo erro desta API é tratado, pelo `GlobalExceptionHandler`.
- O endpoint `GET /api/v1/meta/source/{className}` lê o `.java` **real** do classpath (copiado para lá em build-time via `maven-resources-plugin`) e devolve pro frontend — não é uma cópia congelada em string, é o arquivo que compilou o binário que está respondendo a request.

---

## Stack completa

### Backend
| Tecnologia | Versão | Uso |
|---|---|---|
| Java | 21 | Records, switch expressions, pattern matching |
| Spring Boot | 3.4.1 | Web, Data JPA, Validation, Cache, Security |
| Maven | 3.9.9 | Build e dependências |
| PostgreSQL | 16 | Banco relacional (via Docker Compose) |
| Hibernate | (via Spring Data JPA) | ORM |
| Caffeine | 3.x | Cache local em memória |
| springdoc-openapi | 2.7.0 | Documentação OpenAPI/Swagger |
| Lombok | (só em Entity) | Getters/setters/builder |
| JUnit 5 + Mockito + Testcontainers | — | Unit, web layer e integration tests |

### Frontend
| Tecnologia | Versão | Uso |
|---|---|---|
| React | 18 | UI |
| TypeScript | ~6.0 | Tipagem |
| Vite | 8 | Build tool + dev server |
| Tailwind CSS | v4 | Estilização (`@theme inline`, dark mode via classe) |
| Radix UI | — | Primitivos acessíveis (Dialog, Tabs, Progress, Slot) |
| React Router | v7 | Roteamento |
| Shiki | 4.x | Syntax highlight de Java (bundle fine-grained, sem carregar 150+ linguagens) |
| Lucide React | — | Ícones |
| Axios | — | Cliente HTTP |

---

## Endpoints

### Topics — `/api/v1/topics`
| Método | Rota | Descrição |
|---|---|---|
| GET | `/topics` | Lista tópicos agrupados por categoria (cacheado, `completed` sempre `false`) |
| GET | `/topics/{slug}` | Detalhe completo (content, code, quizzes) + progresso via `?sessionId=` |
| GET | `/topics/search?q=` | Busca por título/conteúdo (ILIKE no Postgres) |
| GET | `/topics/{slug}/related` | Tópicos relacionados |

### Progress — `/api/v1/progress`
| Método | Rota | Descrição |
|---|---|---|
| POST | `/progress/complete` | Marca tópico como concluído (upsert). `201 Created` |
| POST | `/progress/quiz` | Submete respostas, calcula score. `201 Created` |
| GET | `/progress/{sessionId}` | Progresso geral: total, completados, média de quiz |
| GET | `/progress/{sessionId}/stats` | Dashboard: progresso por categoria, streak, % total |

### Meta — `/api/v1/meta` (o diferencial)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/meta/stack` | Stack usada no projeto, mapeada para o tópico que a explica |
| GET | `/meta/source/{className}` | Código-fonte real de uma classe (whitelist: service/controller/config) |

---

## O que este projeto demonstra (no próprio código)

- **Constructor injection em tudo** — [`TopicService.java`](backend/src/main/java/com/javabase/service/TopicService.java) — sem `@Autowired` em field, testável sem subir Spring.
- **`@Cacheable` com TTL diferenciado por cache** — [`CacheConfig.java`](backend/src/main/java/com/javabase/config/CacheConfig.java) — `topics-list` (10min) vs `topic-detail` (30min).
- **A armadilha de self-invocation do `@Cacheable`** — [`TopicSnapshotCache.java`](backend/src/main/java/com/javabase/service/TopicSnapshotCache.java) — por que o cache precisou virar um bean separado, em vez de um método interno de `TopicService`. O mesmo princípio (proxy AOP não intercepta chamada interna) é o tema do tópico "Transações e a Armadilha do Self-Invocation", aplicado a `@Transactional` em [`ProgressService.java`](backend/src/main/java/com/javabase/service/ProgressService.java).
- **`@RestControllerAdvice` centralizado** — [`GlobalExceptionHandler.java`](backend/src/main/java/com/javabase/handler/GlobalExceptionHandler.java) — contrato de erro consistente em toda a API.
- **`@EntityGraph` evitando N+1** — [`TopicRepository.java`](backend/src/main/java/com/javabase/repository/TopicRepository.java) — `findWithQuizzesBySlug` traz tópico + quizzes numa única query.
- **Query nativa agregada** — [`UserProgressRepository.java`](backend/src/main/java/com/javabase/repository/UserProgressRepository.java) — `statsByCategory` faz `LEFT JOIN` + `GROUP BY` numa query só, sem N+1 por categoria.
- **DTOs como `record`** — todo o pacote `dto/` — imutáveis, sem boilerplate, sem Lombok.
- **Whitelist de segurança** — [`MetaService.java`](backend/src/main/java/com/javabase/service/MetaService.java) — regex + lista de pacotes permitidos antes de ler qualquer arquivo do classpath, evitando path traversal.
- **Suíte de testes em camadas** — unit test puro (Mockito), web layer test (`@WebMvcTest`) e integration test (`@SpringBootTest` + Testcontainers contra Postgres real).
- **Bundle fine-grained no frontend** — [`highlighter.ts`](javabase-frontend/src/lib/highlighter.ts) — carrega só a linguagem Java e os dois temas usados, em vez do bundle completo do Shiki (~150 linguagens).
- **Estado compartilhado entre hooks** — [`useProgress.ts`](javabase-frontend/src/hooks/useProgress.ts) — um pub-sub simples em módulo garante que completar um tópico na página do tópico atualiza o checkmark no sidebar, sem prop drilling nem lib de state management.

---

## Deploy

O frontend está pronto pra subir no **Netlify** (`javabase-frontend/netlify.toml` já define o build command e o redirect de SPA — sem isso, dar F5 numa rota como `/topicos/generics` retornaria 404):

1. Conecte o repo no Netlify apontando o "base directory" pra `javabase-frontend`.
2. Configure a env var `VITE_API_URL` no painel do Netlify apontando pro backend (ver `.env.example`).
3. O backend (Spring Boot + Postgres) precisa de um host que rode um processo Java de longa duração — Netlify não serve pra isso (é hospedagem estática + funções serverless). Opções comuns: Render, Railway, Fly.io — qualquer um que suba um container Docker ou um JAR.
4. No backend hospedado, configure `WEB_CORS_ALLOWED_ORIGIN` com o domínio do Netlify (aceita lista separada por vírgula, então dá pra manter o `localhost:5173` de dev junto: `http://localhost:5173,https://seu-site.netlify.app`).

---

## Estrutura

```
Javalearning-page/
├── backend/                    # Spring Boot
│   └── src/main/java/com/javabase/
│       ├── config/              # CORS, Cache, OpenAPI, Security
│       ├── controller/          # @RestController
│       ├── service/             # @Service
│       ├── repository/          # @Repository (Spring Data JPA)
│       ├── entity/               # @Entity (JPA)
│       ├── dto/                  # Records
│       ├── exception/ handler/   # Exceções + @RestControllerAdvice
│       ├── seeder/               # DataSeeder (lê src/main/resources/seed/*.json)
│       └── enums/
├── javabase-frontend/          # React + Vite
│   └── src/
│       ├── components/          # layout/, topic/, progress/, search/, ui/
│       ├── pages/                 # HomePage, TopicPage, DashboardPage, SourceCodePage
│       ├── hooks/ lib/ types/
│       └── App.tsx
└── docker-compose.yml           # PostgreSQL 16
```
