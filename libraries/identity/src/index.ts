export type Principal = {
    isAdmin: boolean,
    email: string,
    teams: string[]
};


export type Permissions = {
    isAdmin: boolean,
    teams: {[team: string]: number}
}; 