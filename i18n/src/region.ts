import regionsToCountry from './resources/regions-to-countries.json';
import counties from './resources/countries.json';

/**
 * Get the time zone setting of the user's device.
 */
export const getTimeZone = () => {
  const { timeZone } = Intl.DateTimeFormat().resolvedOptions();
  return timeZone;
};

/**
 * get current region information such as country name, iso and code
 */
export const getRegion = () => {
  const timeZone = getTimeZone();
  const currentCountry = (regionsToCountry as Record<string, string>)[timeZone];
  const localeCountry = counties.find(
    (country) => country.country.toLowerCase() === currentCountry.toLowerCase(),
  );
  return localeCountry;
};

/**
 * get all countries information
 */
export const getCountries = () => counties;
