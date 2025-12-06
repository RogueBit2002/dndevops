import { Effect, Data, Context} from "effect";

export class EventPublisher extends Context.Tag("EventPublisher")<
    EventPublisher,
    {
        readonly publish: (applictation: string, content: string) => Effect.Effect<void>
    }>() {};


export const createReceiver = (applications: string[]) => (application: string, content: string) => Effect.gen(function*() {
    console.log(`Received event for ${application}`);

    const publisher = yield* EventPublisher;
    publisher.publish(application, content);
});