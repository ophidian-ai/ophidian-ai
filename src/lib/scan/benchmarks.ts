/**
 * Benchmarks
 *
 * Static lookup tables and estimation logic used across all scan modules
 * to translate raw technical metrics into revenue-impact figures.
 */

import type { IndustryBenchmarks } from './types';

// ---------------------------------------------------------------------------
// City tiers
// ---------------------------------------------------------------------------

export interface CityTier {
  label: string;
  maxPopulation: number;
  baseVisitors: number;
}

export const CITY_TIERS: CityTier[] = [
  { label: 'Small',  maxPopulation: 25_000,   baseVisitors: 200  },
  { label: 'Medium', maxPopulation: 100_000,  baseVisitors: 500  },
  { label: 'Large',  maxPopulation: Infinity, baseVisitors: 1500 },
];

// ---------------------------------------------------------------------------
// Industry multipliers
// ---------------------------------------------------------------------------

export const INDUSTRY_MULTIPLIERS: Record<string, number> = {
  'Restaurants':            1.5,
  'Home Services':          1.0,
  'Auto Services':          0.8,
  'Professional Services':  0.6,
  'Health/Wellness':        1.2,
  'default':                1.0,
};

// ---------------------------------------------------------------------------
// Average order values
// ---------------------------------------------------------------------------

export const AVG_ORDER_VALUES: Record<string, number> = {
  'Restaurants':            35,
  'Home Services':          250,
  'Auto Services':          150,
  'Professional Services':  200,
  'Health/Wellness':        100,
  'default':                150,
};

// ---------------------------------------------------------------------------
// Industry benchmarks
// ---------------------------------------------------------------------------

export const INDUSTRY_BENCHMARKS: IndustryBenchmarks = {
  avg_load_time:       3.2,
  mobile_friendly_pct: 87,
  gbp_presence_pct:    72,
};

// ---------------------------------------------------------------------------
// Severity weights
// ---------------------------------------------------------------------------

export const SEVERITY_WEIGHTS: Record<string, number> = {
  critical: 0.15,
  moderate: 0.07,
  minor:    0.03,
};

// ---------------------------------------------------------------------------
// City populations (US Census 2020, lowercase keys)
// ---------------------------------------------------------------------------

export const CITY_POPULATIONS: Record<string, number> = {
  // Indiana
  'indianapolis':       887_642,
  'fort wayne':         264_488,
  'evansville':         117_429,
  'south bend':         103_453,
  'carmel':             99_757,
  'fishers':            98_392,
  'bloomington':        79_168,
  'hammond':            77_879,
  'gary':               70_273,
  'lafayette':          70_166,
  'muncie':             65_194,
  'terre haute':        58_461,
  'kokomo':             57_568,
  'noblesville':        69_604,
  'anderson':           54_298,
  'greenwood':          63_701,
  'elkhart':            53_923,
  'mishawaka':          48_833,
  'columbus':           47_443,
  'lawrence':           49_296,
  'jeffersonville':     48_612,
  'new albany':         36_732,
  'richmond':           35_058,
  'westfield':          44_452,
  'avon':               20_253,
  'portage':            36_828,
  'michigan city':      31_479,
  'east chicago':       27_387,
  'merrillville':       35_143,
  'plainfield':         35_491,
  'valparaiso':         30_520,
  'goshen':             35_613,
  'zionsville':         28_169,
  'crown point':        30_360,
  'vincennes':          15_686,
  'east chicago city':  27_387,
  'marion':             28_422,

  // Top 100 US cities (Census 2020)
  // Note: keys that would collide with Indiana entries above are suffixed with state.
  'new york':              8_336_817,
  'los angeles':           3_979_576,
  'chicago':               2_693_976,
  'houston':               2_304_580,
  'phoenix':               1_608_139,
  'philadelphia':          1_603_797,
  'san antonio':           1_434_625,
  'san diego':             1_386_932,
  'dallas':                1_304_379,
  'san jose':              1_013_240,
  'austin':                961_855,
  'jacksonville':          949_611,
  'fort worth':            918_915,
  'columbus oh':           905_748,
  'charlotte':             874_579,
  'san francisco':         873_965,
  'seattle':               737_255,
  'denver':                715_522,
  'nashville':             689_447,
  'oklahoma city':         681_054,
  'el paso':               678_815,
  'washington':            689_545,
  'boston':                675_647,
  'memphis':               651_073,
  'louisville':            633_045,
  'portland':              652_503,
  'las vegas':             641_903,
  'baltimore':             585_708,
  'milwaukee':             577_222,
  'albuquerque':           564_559,
  'tucson':                542_629,
  'fresno':                542_107,
  'mesa':                  504_258,
  'sacramento':            524_943,
  'kansas city':           508_090,
  'atlanta':               498_715,
  'omaha':                 486_051,
  'colorado springs':      478_961,
  'raleigh':               467_665,
  'long beach':            466_742,
  'virginia beach':        459_470,
  'minneapolis':           429_606,
  'tampa':                 399_700,
  'new orleans':           383_997,
  'arlington':             394_266,
  'bakersfield':           403_455,
  'honolulu':              350_964,
  'anaheim':               346_824,
  'aurora':                366_623,
  'santa ana':             310_227,
  'corpus christi':        326_586,
  'riverside':             314_998,
  'lexington':             322_570,
  'st. louis':             301_578,
  'pittsburgh':            302_971,
  'stockton':              320_804,
  'anchorage':             291_247,
  'cincinnati':            309_317,
  'st. paul':              311_527,
  'toledo':                270_871,
  'greensboro':            299_035,
  'newark':                282_011,
  'plano':                 285_494,
  'henderson':             320_189,
  'lincoln':               291_082,
  'buffalo':               278_349,
  'jersey city':           292_449,
  'chula vista':           274_492,
  'orlando':               307_573,
  'st. petersburg':        258_308,
  'norfolk':               238_005,
  'chandler':              261_165,
  'laredo':                255_205,
  'madison':               269_186,
  'durham':                278_993,
  'lubbock':               257_141,
  'winston-salem':         249_545,
  'garland':               246_018,
  'glendale az':           246_709,
  'hialeah':               233_339,
  'reno':                  264_165,
  'baton rouge':           227_470,
  'irvine':                307_670,
  'chesapeake':            249_422,
  'scottsdale':            258_069,
  'north las vegas':       262_527,
  'fremont':               230_504,
  'gilbert':               267_918,
  'san bernardino':        222_101,
  'boise':                 235_684,
  'birmingham':            212_237,
  'rochester':             211_328,
  'richmond va':           226_610,
  'spokane':               222_081,
  'des moines':            214_237,
  'montgomery':            199_518,
  'modesto':               218_464,
  'fayetteville':          211_751,
  'tacoma':                219_346,
  'akron':                 190_469,
  'aurora il':             200_946,
  'yonkers':               211_569,
  'glendale ca':           246_709,
};

// ---------------------------------------------------------------------------
// Visitor estimation
// ---------------------------------------------------------------------------

/**
 * Estimate monthly organic/local search visitors for a business based on
 * city population and industry.
 *
 * @param cityPopulation - Population of the city where the business operates.
 * @param industry       - Industry key matching INDUSTRY_MULTIPLIERS.
 * @returns Estimated monthly visitors (rounded to nearest integer).
 */
export function estimateMonthlyVisitors(
  cityPopulation: number,
  industry: string,
): number {
  // Find the city tier for this population
  const tier = CITY_TIERS.find((t) => cityPopulation <= t.maxPopulation) ?? CITY_TIERS[CITY_TIERS.length - 1];

  const multiplier = INDUSTRY_MULTIPLIERS[industry] ?? INDUSTRY_MULTIPLIERS['default'];

  return Math.round(tier.baseVisitors * multiplier);
}
