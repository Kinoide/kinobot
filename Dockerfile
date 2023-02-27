FROM denoland/deno:alpine-1.31.1
# arm64: Use lukechannings/deno:v1.31.1 instead

WORKDIR /app

RUN mkdir ./src ./views
COPY ./src/deps.ts ./src/deps.ts
RUN deno cache ./src/deps.ts

ADD ./src ./src
ADD ./views ./views

RUN deno cache ./src/start.ts

USER deno

COPY ./patch_notes.json ./patch_notes.json
ENV VERSION="3.0.0"

CMD ["run", "--allow-read", "--allow-net", "--allow-env", "./src/start.ts"]