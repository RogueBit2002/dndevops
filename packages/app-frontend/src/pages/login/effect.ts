import { Effect, Layer } from "effect";
import { ApiClient } from "../../lib/client";

type L = Layer.Layer<ApiClient, never, never>;

let _layer: L | undefined;
export const _setup = (layer: L) => _layer = layer;

export const runEffectful = <T,>(effect: Effect.Effect<T, never, ApiClient>): Promise<T> => Effect.runPromise(effect.pipe(Effect.provide(_layer!)));
