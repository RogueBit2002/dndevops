// RedisService

import { Config, Effect, Redacted } from "effect";

import { createClient } from "redis";
import * as amqp from "amqplib";

export class AppConfig extends Effect.Service<AppConfig>()("@dndevops/AppConfig", {
    effect: Effect.gen(function*() {
        return Object.freeze({
            admins: (yield* Config.string("DNDEVOPS_ADMINS")).split(" ")
        });
    })
}){};

export class RuntimeConfig extends Effect.Service<RuntimeConfig>()("@dndevops/RuntimeConfig", {
    effect: Effect.gen(function*() {
        return Object.freeze({
            redisUri: yield* Config.redacted("REDIS_URI"),
            amqpUri: yield* Config.redacted("AMQP_URI"),
            postgresqlUri: yield* Config.redacted("POSTGRESQL_URI"),
            httpAddress: yield* Config.string("HTTP_ADDRESS"),
            httpPort: yield* Config.string("HTTP_PORT")
        })
    })
}){};

// TODO: Do something with a scope and clean it up

export class RedisService extends Effect.Service<RedisService>()("@dndevops/RedisService", {
    dependencies: [ RuntimeConfig.Default ],
    effect: Effect.gen(function*() {
        
        const rc = yield* RuntimeConfig;

        const _client = yield* Effect.promise(() => createClient({
            url:  Redacted.value(rc.redisUri)
        }).connect());

        return {
            use: Effect.fn(function*<T>(callback: (client: typeof _client) => Promise<T>) {
                const r = yield* Effect.promise(() => callback(_client));

                return r;
            })
        }
    })
}){};

// TODO: Check if scoped effect is working

export class AMQPService extends Effect.Service<AMQPService>()("@dndevops/AMQPService", {
    effect: Effect.scoped(Effect.gen(function*() {

        const rc = yield* RuntimeConfig;

        const _connection = yield* Effect.promise(() => amqp.connect(Redacted.value(rc.amqpUri)));
        const _channel = yield* Effect.promise(() => _connection.createChannel());

        yield* Effect.addFinalizer((exit) => Effect.promise(async () => { await _channel.close(); await _connection.close(); }));

        return {
            use: Effect.fn(function*<T>(callback: (connection: amqp.Channel) => Promise<T>) {
                const r = yield* Effect.promise(() => callback(_channel));

                return r;
            })
        };
    }))
}){};