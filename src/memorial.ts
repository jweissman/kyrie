// Someone who died in a country, as the country remembers them: their name, where they fell, and how. The runtime's,
// not the world's (MT-16): the session, the obituary and the page carry it as a record, and only the setting's
// Memorials (src/world/memorial.ts) writes it into a country.
export interface Memorial { name: string; place: string; how: string }
