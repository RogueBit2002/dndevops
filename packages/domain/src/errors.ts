import { Data, Schema } from "effect";

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()(`@dndevops/errors/Unauthorized`, {}) {};
export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(`@dndevops/errrors/UserNotFound`, {}) {};
export class TeamNotFoundError extends Schema.TaggedError<TeamNotFoundError>()(`@dndevops/errrors/TeamNotFound`, {}) {};