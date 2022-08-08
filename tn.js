import Bare from '@tomphttp/bare-client';

const BareClient = new Bare('/bare/');

const Request = BareClient.fetch('https://www.google.com', {method: 'GET'})