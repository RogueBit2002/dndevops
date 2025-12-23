import { Config, Context, Effect } from "effect";
import { createTransport } from "nodemailer";


export class MailSender extends Context.Tag("@dndevops/backend-core/MailSender")<MailSender, 
(receiver: string, subject: string, content: string) => Effect.Effect<void, never, never>
>(){
	static readonly make = Effect.fn(function*(uri: string, sender: string) {
		const transport = createTransport(uri);

		return Effect.fn(function*(receiver: string | string[], subject: string, content: string) {
			console.log("sending mail!");
			yield* Effect.promise(() => transport.sendMail({from: `<${sender}>`, to: receiver, subject, text: content}));
			
			console.log("Sent the mail!");
		});
	});
};

export class AppConfig extends Effect.Service<AppConfig>()("@dndevops/backend-core/AppConfig", {
	effect: Effect.gen(function*() {
	
		const admins = (yield* Config.string("DNDEVOPS_ADMINS").pipe(Config.withDefault(""))).split(";");
		const jwtSecret = yield* Config.redacted("DNDEVOPS_JWT_SECRET");

		return Object.freeze({
			admins: Object.freeze(admins),
			jwtSecret
		})
	})
}){};