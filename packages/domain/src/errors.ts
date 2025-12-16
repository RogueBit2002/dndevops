import { Data, Schema } from "effect";

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()(`@dndevops/errors/Unauthorized`, {}) {};
export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(`@dndevops/errrors/UserNotFound`, {}) {};
export class TeamNotFoundError extends Schema.TaggedError<TeamNotFoundError>()(`@dndevops/errrors/TeamNotFound`, {}) {};
export class InvalidPermissionsError extends Schema.TaggedError<InvalidPermissionsError>()(`@dndevops/errrors/InvalidPermissions`, {}) {};
export class InvalidDataError extends Schema.TaggedError<InvalidDataError>()(`@dndevops/errrors/InvalidData`, {}) {};