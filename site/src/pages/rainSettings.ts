export const rainDefaults = {
  density: 1020, speed: 1.95, wind: 0.13, length: 0.56, thickness: 0.84, opacity: 0.86,
  splashFrequency: 100, splashSize: 0.32, splashDuration: 0.55,
  lightIntensity: 0.95, lightRadius: 1, lightning: 3,
  rainColor: '#acc5dd', splashColor: '#cce6ff', lightColor: '#ffde87',
};

export type RainSettings = typeof rainDefaults;
