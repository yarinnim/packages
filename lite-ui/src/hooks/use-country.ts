import { useCallback, useMemo, useState } from 'react';
import { getCountries, find, filter, type Country } from '../utils/country';

type UseCountryProps = {
  countryCodes?: string[],
  defaultCountryCode?: string,
};

type UseCountry = {
  countries: Country[],
  country: Country,
  /* eslint-disable-next-line no-unused-vars */
  setCountry: (country: Country) => void,
  /* eslint-disable-next-line no-unused-vars */
  findCountry: (code: string) => Country | undefined,
  /* eslint-disable-next-line no-unused-vars */
  searchCountries: (query: string) => Country[] | [],
};

export default function useCountry(props: UseCountryProps): UseCountry {
  const { countryCodes = [], defaultCountryCode = '' } = props;
  const countries = useMemo(() => getCountries(countryCodes), []);
  const findCountry = useCallback((code: string) => find(code, countries), []);
  const searchCountries = useCallback((query: string) => filter(query, countries), []);

  const defCountry: Country = (defaultCountryCode === ''
    ? countries[0]
    : find(defaultCountryCode)
  ) as Country;

  const [country, setCountry] = useState(defCountry);

  return {
    country,
    setCountry,
    countries,
    findCountry,
    searchCountries,
  };
}
