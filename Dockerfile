FROM denoland/deno:alpine-1.31.1 AS builder
# arm64: Use lukechannings/deno:v1.31.1 instead
WORKDIR /app
RUN mkdir ./src ./views
# Cache deps
COPY ./src/deps.ts ./src/deps.ts
RUN deno cache ./src/deps.ts
# Copy source
ADD ./src ./src
# Compile
RUN deno compile --allow-read --allow-net --allow-env --output kinobot src/start.ts

FROM frolvlad/alpine-glibc:alpine-3.17
ARG version=dev
WORKDIR /root/
# Copy executable
COPY --from=builder /app/kinobot ./kinobot
# Copy views
ADD ./views ./views
# Copy patch notes
COPY ./patch_notes.json ./patch_notes.json
ENV VERSION=${version}
ENTRYPOINT [ "/root/kinobot" ]
