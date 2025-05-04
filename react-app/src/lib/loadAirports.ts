import Papa from 'papaparse';

export interface Airport {
  id: string;
  iata: string;
  name: string; // from en-GB
}

export const loadAirports = async (): Promise<Airport[]> => {
  const response = await fetch('/iata_airports_and_locations_with_vibes.csv');
  const text = await response.text();
  const { data } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });

  return (data as any[]).map((row) => ({
    id: row.id,
    iata: row.IATA,
    name: row['en-GB'],
  })).filter(a => a.name && a.iata); // Optional: filter invalid rows
};
