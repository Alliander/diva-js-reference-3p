const diva = require('diva-irma-js');
const qr = require('qr-image');
const logger = require('./../common/logger')('actions');

/**
 * Request handler for starting a new disclosure session via GET request for a single attribute
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object containing a PNG with QR code
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  const attribute = req.query.attribute;
  const attributeLabel = req.query.attributeLabel;
  if (attribute && attributeLabel) {
    diva
      .startDisclosureSession(req.sessionId, attribute, attributeLabel)
      .then((irmaSessionData) => {
        res.setHeader('Content-type', 'image/png');
        res.setHeader('Content-Disposition', 'inline; filename="qr.png"'); // Note: to force display in browser
        qr.image(irmaSessionData.qrContent, { type: 'png' }).pipe(res);
      })
      .catch((error) => {
        logger.warn('Error starting IRMA session');
        logger.debug(error);
        res.end(error.toString());
      });
  } else {
    res.end('attribute or attributesLabel not set.');
  }
};
