const diva = require('diva-irma-js');
const divaSession = require('diva-irma-js/session');
const config = require('./../config');
const request = require('superagent');
const moment = require('moment');
const BPromise = require('bluebird');
const uuidv4 = require('uuid/v4');

function getAddressZipcode(sessionId) {
  return divaSession.getAttributes(sessionId)
    .then((attributes) => {
      const address = attributes['pbdf.pbdf.idin.address'][0];
      const zipcode = attributes['pbdf.pbdf.idin.zipcode'][0];
      return [address, zipcode];
    });
}

function getEan(address, zipcode) {
  const elecEanPromise = request
    .post(config.eanServiceUrl)
    .send({ adres: address, postcode: zipcode });

  const gasEanPromise = request
    .post(config.eanServiceUrl)
    .send({ adres: address, postcode: zipcode, mode: 'GAS' });

  return BPromise.all([elecEanPromise, gasEanPromise])
    .then(responses => ([
      responses[0].body.ean, // elecEan
      responses[1].body.ean, // gasEan
      address,
      zipcode,
    ]));
}

function constructEanDisclosureContent(address, zipcode) {
  return [
    {
      label: 'Address',
      attributes: {
        'pbdf.pbdf.idin.address': address,
      },
    }, {
      label: 'Zipcode',
      attributes: {
        'pbdf.pbdf.idin.zipcode': zipcode,
      },
    },
  ];
}

function constructEanAttributes(eanelec, eangas) {
  const attributes = {
    pseudonym: uuidv4(),
    eanelec,
    eangas,
  };

  return attributes;
}

function getEanIssueSession(elecEan, gasEan, address, zipcode) {
  const disclosureContent = constructEanDisclosureContent(address, zipcode);
  const attributes = constructEanAttributes(elecEan, gasEan);

  return diva.startIssueSession([{
    credential: 'irma-demo.alliander.connection',
    validity: moment().add(6, 'months').unix(),
    attributes,
  }], disclosureContent);
}

function startEanIssueSession(sessionId) {
  return getAddressZipcode(sessionId)
    .then(attributes => getEan(...attributes))
    .then(eanInfo => getEanIssueSession(...eanInfo));
}

module.exports.startEanIssueSession = startEanIssueSession;
