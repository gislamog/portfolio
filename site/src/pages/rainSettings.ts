export const rainDefaults = {
  density: 180, speed: 1, wind: 0.36, length: 1, thickness: 1, opacity: 1,
  splashFrequency: 100, splashSize: 1, splashDuration: 1,
  lightIntensity: 0.8, lightRadius: 0.5, lightning: 0,
  rainColor: '#99b8d6', splashColor: '#cce6ff', lightColor: '#ffde87',
};

export type RainSettings = typeof rainDefaults;
