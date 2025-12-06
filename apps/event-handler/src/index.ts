import { Effect, pipe } from "effect";

import { createReceiver, EventPublisher } from "@dndevops/module-event-receiver";

const receive = createReceiver(["devops"]);

const program = receive("devops", "foobar").pipe(
	Effect.provideService(EventPublisher, EventPublisher.of({
		publish: (application: string, content: string) => Effect.succeed(console.log("Published!"))
	}))
);

Effect.runSync(program);