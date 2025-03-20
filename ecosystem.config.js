module.exports = {
  apps : [{
    name   : "Backend",
    script : "./dist/app.js",
    env_production : {
      NODE_ENV: "production"
    }
  }]

}
