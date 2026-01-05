import { Data, Schema } from "effect";

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()(`@dndevops-domain/errors/Unauthorized`, {}) {};
export class UserNotFoundError extends Schema.TaggedError<UserNotFoundError>()(`@dndevops-domain/errrors/UserNotFound`, {}) {};
export class TeamNotFoundError extends Schema.TaggedError<TeamNotFoundError>()(`@dndevops-domain/errrors/TeamNotFound`, {}) {};
export class InvalidPermissionsError extends Schema.TaggedError<InvalidPermissionsError>()(`@dndevops-domain/errrors/InvalidPermissions`, {}) {};
export class InvalidDataError extends Schema.TaggedError<InvalidDataError>()(`@dndevops-domain/errrors/InvalidData`, {}) {};
export class BoardNotFoundError extends Schema.TaggedError<BoardNotFoundError>()(`@dndevops-domain/errors/BooardNotFound`, {}) {};
export class InventoryNotFoundError extends Schema.TaggedError<InventoryNotFoundError>()(`@dndevops-domain/errors/InventoryNotFoundError`, {}) {};