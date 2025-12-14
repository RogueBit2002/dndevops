// RedisService

import { Config, Effect, Redacted } from "effect";

import * as amqp from "amqplib";
import mongoose from 'mongoose';
import { createTransport } from "nodemailer";

export class AppConfig extends Effect.Service<AppConfig>()("@dndevops/AppConfig", {
    effect: Effect.gen(function*() {
        return Object.freeze({
            admins: (yield* Config.string("DNDEVOPS_ADMINS")).split(" "),
            jwt_secret: yield* Config.string("DNDEVOPS_JWT_SECRET")
        });
    })
}){};


export class RuntimeConfig extends Effect.Service<RuntimeConfig>()("@dndevops/RuntimeConfig", {
    effect: Effect.gen(function*() {
        return {
            mongodb_uri: yield* Config.redacted("DNDEVOPS_MONGODB_URI"),
            amqp_uri: yield* Config.redacted("DNDEVOPS_AMQP_URI"),
            http: {
                address: yield* Config.string("DNDEVOPS_HTTP_ADDRESS").pipe(Config.withDefault("0.0.0.0")),
                port: yield* Config.string("DNDVEVOPS_HTTP_PORT").pipe(Config.withDefault(3000))
            },
            smtp: {
                uri: yield* Config.redacted("DNDEVOPS_SMTP_URI"),
                sender: yield* Config.string("DNDEVOPS_SMTP_SENDER")
            }
        };
    })
}){};
/*
// TODO: Check if scoped effect is working

export class AMQPService extends Effect.Service<AMQPService>()("@dndevops/AMQPService", {
    effect: Effect.scoped(Effect.gen(function*() {

        console.log("Creating AMQPService!");
        const rc = yield* RuntimeConfig;

        const _connection = yield* Effect.promise(() => amqp.connect(Redacted.value(rc.amqp_uri)));
        const _channel = yield* Effect.promise(() => _connection.createChannel());

        yield* Effect.addFinalizer((exit) => Effect.promise(async () => { await _channel.close(); await _connection.close(); }));

        return {
            use: Effect.fn(function*<T>(callback: (connection: amqp.Channel) => Promise<T>) {
                const r = yield* Effect.promise(() => callback(_channel));

                return r;
            })
        };
    }))
}){};*/

export class MailService extends Effect.Service<MailService>()("@dndevops/MailService", {
    dependencies: [ RuntimeConfig.Default ],
    effect: Effect.gen(function*() {

        /*const mailer = createTransport({
			host: "mailpit",
			port: 1025 ,
			secure: false, // true for 465, false for other ports
			auth: {
				user: "login@doesnt.matter",
				pass: "beepboop",
			},
		});*/
        
        const runtimeConfig = yield* RuntimeConfig;

        //const mailer = createTransport(Redacted.value(runtimeConfig.smtp.uri));
        const mailer = createTransport({
            host: "127.0.0.1",
            port: 1025,
            secure: false
        });
        
        return {
            send: Effect.fn(function*(to: string | string[], subject: string, content: string) {
                
                const x = yield* Effect.promise(() => mailer.sendMail({ from: `<${runtimeConfig.smtp.sender}>`, to, subject, text: content}) );
            })
        };
    })
}) {};
export class MongooseService extends Effect.Service<MongooseService>()("@dndevops/MongooseService", {
    dependencies: [ RuntimeConfig.Default ],
    effect: Effect.scoped(Effect.gen(function*() {

        const runtimeConfig = yield* RuntimeConfig;

        const connection = yield* Effect.promise(async() => mongoose.createConnection(Redacted.value(runtimeConfig.mongodb_uri)));

        mongoose.connect(Redacted.value(runtimeConfig.mongodb_uri). {
            
        });
        yield* Effect.addFinalizer((exit) => Effect.promise(async () => connection.close()));

        return {
            use: Effect.fn(function*<T>(callback: (connection: mongoose.Connection) => Promise<T>) {
                const r = yield* Effect.promise(() => callback(connection));

                return r;
            })
        }
    }))
}){};