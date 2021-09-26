export const environment = {
  production: true,
  remoteServiceBaseUrl : 'https://' + location.hostname + '/iq/modules/adhocreporter/1.0/rest/v1/clients/{clientCode}/adhocreporter',
  // @ts-ignore
  clientCode : window.parent.Picasso.env.clientCode,
  // @ts-ignore
  userName : window.parent.Picasso.env.user.name,
  useHash : true
};
