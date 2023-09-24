import { Plugin } from 'vite';

type Options = {
  timezone: string;
};

/** Removes unnecessary timezones from moment-timezone data files. */
export default function momentPlugin({ timezone }: Options): Plugin {
  return {
    name: 'momentPlugin',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('data/packed/latest.json')) return undefined;
      const original = JSON.parse(code);
      const trimmed = {
        ...original,
        // Keep timezones named UTC or the given timezone
        zones: original.zones.filter((zone: string) => zone.startsWith('UTC|') || zone.startsWith(`${timezone}|`)),
        // Keep link named "UTC" (since the full name is "Etc/UTC" in the DB and we want "UTC" to work)
        links: original.links.filter((link: string) => link.endsWith('|UTC')),
        // Keep countries that use the given timezone
        countries: original.countries.filter((country: string) => country.includes(timezone)),
      };
      if (!trimmed.zones.some((zone: string) => zone.startsWith(`${timezone}|`))) {
        return {
          errors: [{
            text: `Unable to find timezone ${timezone} in moment-timezone data file.`,
          }],
        };
      }
      return {
        code: JSON.stringify(trimmed),
        map: { mappings: '' },
      };
    },
  };
}
