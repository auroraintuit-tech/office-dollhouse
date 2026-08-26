const appJson = require('./app.json');

module.exports = () => {
  const baseUrl = process.env.EXPO_BASE_URL?.trim();
  const experiments = { ...appJson.expo.experiments };

  if (baseUrl) {
    experiments.baseUrl = baseUrl;
  }

  return {
    ...appJson.expo,
    experiments,
  };
};
