import {  createRoot } from 'react-dom/client'
import App from './App.tsx';
import { Effect, Layer } from 'effect';
import { ApiClient } from '../../lib/client.ts';

const appLayer = ApiClient.Default;

const runEffectful = <T,>(effect: Effect.Effect<T, never, ApiClient>): Promise<T> => Effect.runPromise(effect.pipe(Effect.provide(appLayer)));

createRoot(document.getElementById('root')!).render(
    <App />
);