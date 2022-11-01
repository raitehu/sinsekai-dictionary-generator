FROM node:16-alpine3.16
WORKDIR /app

RUN yarn install --frozen-lockfile

COPY --chown=node:node . .
VOLUME [ "/app" ]

ENTRYPOINT /bin/sh
