module.exports = {
  apps: [
    {
      name: 'quiz-ground-was1',
      script: 'dist/src/main.js',
      env: {
        WAS_PORT: 3000
      }
    },
    {
      name: 'quiz-ground-was2',
      script: 'dist/src/main.js',
      env: {
        WAS_PORT: 3001
      }
    }
  ]
};
