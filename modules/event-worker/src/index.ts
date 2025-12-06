import { Data } from "effect";

export class InvalidEventError extends Data.TaggedError("InvalidEventError")<{}> {};