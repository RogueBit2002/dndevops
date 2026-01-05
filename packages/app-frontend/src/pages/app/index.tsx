import {  createRoot } from 'react-dom/client'
import App from './App.tsx';
import { Effect, Layer } from "effect";
import { ApiClient, AutomatedAccessToken } from "../../lib/client.ts";

const gotoLogin = () => window.location.href = "login";
let initialRefreshToken : string;
try {
	initialRefreshToken = JSON.parse(document.cookie)["token"] as string;
	
	if(!initialRefreshToken)
		window.location.href = "login";
} catch(e) {
	window.location.href = "login";
	throw "Leaving";
}


const apiLayer = Layer.mergeAll(Layer.effect(
	AutomatedAccessToken,
	AutomatedAccessToken.make(initialRefreshToken, () => { window.location.href = "login" }, (token) => document.cookie = JSON.stringify({ token }))
).pipe(Layer.provide(ApiClient.Default)), ApiClient.Default);

createRoot(document.getElementById('root')!).render(<App />);