import { type Country, countries } from './assets/countries';
export { type Country } from './assets/countries';

const getParamCountries = (pCountries: Country[]): Country[] => {
  const shadowCountries = pCountries.length === 0 ? getCountries() : pCountries;
  return shadowCountries;
};

export const getCountries = (codes: string[] = []): Country[] => {
  if (codes.length === 0) return [...countries.values()] as Country[];
  return codes.map((code: string) => countries.get(code.toUpperCase())) as Country[];
};

const matches = (country: Country, query: string) => country.name.toLowerCase().includes(query)
  || country.code.toLowerCase().includes(query)
  || country.dialCode.includes(query)
  || country.nativeName.includes(query);

export const filter = (pQuery: string, pCountries: Country[] = []): Country[] => {
  const query = pQuery.trim().toLowerCase();
  const shadCountries = getParamCountries(pCountries);
  if (query.length === 0) return shadCountries;
  return shadCountries.filter((country: Country) => matches(country, query));
};

export const find = (pCode: string, pCountries: Country[] = []): Country | undefined => {
  const shadCountries = getParamCountries(pCountries);
  const code = pCode.trim().toUpperCase();
  if (pCountries.length === 0) return countries.get(code) as Country || undefined;
  return shadCountries.find((country) => country.code === code);
};
