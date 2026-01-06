import {  createRoot } from 'react-dom/client'
import App from './App.tsx';
import { Effect, Layer } from "effect";
import { ApiClient, AutomatedAccessToken } from "../../lib/client.ts";

const gotoLogin = () => window.location.href = "login";
let initialRefreshToken : string;

try {
	initialRefreshToken = JSON.parse(document.cookie)["token"] as string;
	
	if(!initialRefreshToken)
		throw "";
} catch(e) {
	gotoLogin();
	throw "Leaving";
}

const apiLayer = Layer.mergeAll(Layer.effect(
	AutomatedAccessToken,
	AutomatedAccessToken.make(initialRefreshToken, gotoLogin, (token) => document.cookie = JSON.stringify({ token }))
).pipe(Layer.provide(ApiClient.Default)), ApiClient.Default);

const runEffectful = <T,>(effect: Effect.Effect<T, never, ApiClient | AutomatedAccessToken>): Promise<T> => Effect.runPromise(effect.pipe(Effect.provide(apiLayer)));

const header = Effect.gen(function*() {
	return () => <h1>Hi!</h1>;
});

const teams = runEffectful(Effect.gen(function*() {
	const MyHeader = yield* header;
	return <div>
		<MyHeader></MyHeader>
	</div>
}))


createRoot(document.getElementById('root')!).render(<App />);