# Kinobot

Pour vrais kinophiles

```sh
# Run
deno run --allow-read --allow-net --allow-env src/start.ts

# Docker
docker build -t kinobot:latest .
docker run --env-file .env -p 8080:8080 kinobot:latest
```
