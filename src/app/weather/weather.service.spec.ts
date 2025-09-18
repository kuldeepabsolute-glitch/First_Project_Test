import { TestBed } from '@angular/core/testing';
import { WeatherService } from './weather.service';
import { WEATHER_CONFIG } from './weather.config';

describe('WeatherService', () => {
  let svc: WeatherService;
  let originalConfig: any;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [WeatherService] });
    svc = TestBed.inject(WeatherService);
    // snapshot the config so tests can modify
    originalConfig = { ...WEATHER_CONFIG };
  });

  afterEach(() => {
    // restore config
    (WEATHER_CONFIG as any).OPENWEATHER_API_KEY = originalConfig.OPENWEATHER_API_KEY;
    (WEATHER_CONFIG as any).ENABLE_REVERSE_GEOCODE = originalConfig.ENABLE_REVERSE_GEOCODE;
    // restore fetch if needed
    if ((window as any).fetch && (window as any)._originalFetch) {
      (window as any).fetch = (window as any)._originalFetch;
      delete (window as any)._originalFetch;
    }
  });

  it('reverseGeocode should prefer locality fields', async () => {
    // mock fetch for nominatim
  (window as any)._originalFetch = (window as any).fetch;
  (window as any).fetch = jasmine.createSpy('fetch').and.callFake((url: string) => {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ address: { hamlet: 'Smallville', county: 'XCounty', country_code: 'in' } }) });
    });

    const res = await svc.reverseGeocode(12.34, 56.78);
    expect(res).toBeTruthy();
    expect(res?.city).toBe('Smallville');
    expect(res?.country).toBe('IN');
  });

  it('getCurrentWeatherByCoords should call OpenWeather by coords when api key present', async () => {
    // enable API key and mock fetch for openweather
    (WEATHER_CONFIG as any).OPENWEATHER_API_KEY = 'FAKEKEY123';
  (window as any)._originalFetch = (window as any).fetch;
  (window as any).fetch = jasmine.createSpy('fetch').and.callFake((url: string) => {
      if (url.includes('openweathermap.org/data/2.5/weather')) {
        const payload = { name: 'TestCity', sys: { country: 'IN' }, main: { temp: 29, temp_min: 27, temp_max: 31, humidity: 50 }, wind: { speed: 3.4 }, weather: [{ id:800, description:'clear' }] };
        return Promise.resolve({ ok: true, json: () => Promise.resolve(payload) });
      }
      return Promise.resolve({ ok: false });
    });

    const d = await svc.getCurrentWeatherByCoords(12.34, 56.78);
    expect(d).toBeTruthy();
    expect(d.name).toBe('TestCity');
    expect(d.main.temp).toBe(29);
  });

  it('getCurrentWeatherByCoords should fallback to stub when reverse geocode disabled', async () => {
    (WEATHER_CONFIG as any).ENABLE_REVERSE_GEOCODE = false;
    // ensure no openweather key
    (WEATHER_CONFIG as any).OPENWEATHER_API_KEY = '';
    const d = await svc.getCurrentWeatherByCoords(11.11, 22.22);
    expect(d).toBeTruthy();
    expect(d.name).toContain('Lat');
  });
});
