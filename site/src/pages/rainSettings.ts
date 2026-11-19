export const rainDefaults = {
  density: 820, speed: 1.95, wind: 0.13, length: 0.45, thickness: 0.55, opacity: 0.9,
  splashFrequency: 100, splashSize: 0.32, splashDuration: 0.55,
  lightIntensity: 0.95, lightRadius: 1, lightning: 2,
  rainColor: '#99b8d6', splashColor: '#cce6ff', lightColor: '#ffde87',
};

export type RainSettings = typeof rainDefaults;
