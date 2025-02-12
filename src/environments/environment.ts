// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  url: "http://localhost:4000/api/v1/",
  sistema: 47,
  url_seguridad: "http://localhost:3009/api/v1/",
  loginUrlAsus: 'https://test.asuss.gob.bo/asuss-asegurado-api/api/v1/login',
  consultaUrlAsus:
    'https://test.asuss.gob.bo/asuss-asegurado-api/api/v2/interoperabilidad/segip/consultaDatosPersona',
  userNameAsus: 'cbes',
  passwordAsus: 'cbes.2022**',
};
