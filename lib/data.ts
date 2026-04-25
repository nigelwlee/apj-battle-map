import type { Country, Account, Person, Edge, Intel } from "./types";
import countriesRaw from "@/data/countries.json";
import accountsRaw from "@/data/accounts.json";
import peopleRaw from "@/data/people.json";
import edgesRaw from "@/data/edges.json";
import intelRaw from "@/data/intel.json";

export const countries = countriesRaw as Country[];
export const accounts = accountsRaw as Account[];
export const people = peopleRaw as Person[];
export const edges = edgesRaw as Edge[];
export const intel = intelRaw as Intel[];

export function getAccountById(id: string): Account | undefined {
  return accounts.find((a) => a.id === id);
}

export function getPersonById(id: string): Person | undefined {
  return people.find((p) => p.id === id);
}

export function getAccountsByCountry(code: string): Account[] {
  return accounts
    .filter((a) => a.countryCode === code)
    .sort((a, b) => a.rank - b.rank);
}

export function getPeopleByAccount(accountId: string): Person[] {
  return people.filter((p) => p.accountId === accountId);
}

export function getIntelByAccount(accountId: string): Intel[] {
  return intel
    .filter((i) => i.accountId === accountId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getEdgesForPerson(personId: string): Edge[] {
  return edges.filter(
    (e) => e.sourceId === personId || e.targetId === personId
  );
}

export function getCountryByCode(code: string): Country | undefined {
  return countries.find((c) => c.code === code);
}
