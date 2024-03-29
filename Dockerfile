FROM denoland/deno:alpine-1.41.2 AS builder
# arm64: Use lukechannings/deno:v1.31.1 instead
WORKDIR /app

COPY ./deno.json ./deno.json

RUN mkdir ./src
# Cache deps
COPY ./src/deps.ts ./src/deps.ts
RUN deno cache ./src/deps.ts
# Copy source
ADD ./src ./src
# Compile
RUN deno compile --allow-read --allow-net --allow-env --output kinobot src/start.ts

FROM frolvlad/alpine-glibc:alpine-3.19
ARG version=docker
WORKDIR /root/
# Copy executable
COPY --from=builder /app/kinobot ./kinobot
# Copy views
ADD ./views ./views
ADD ./locales ./locales
ENV VERSION=${version}
ENTRYPOINT [ "/root/kinobot" ]
