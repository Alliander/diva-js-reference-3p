const diva = require('diva-irma-js');

const Policy = require('../../database/models/Policy');

/**
 * Request handler
 * @function requestHandler
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @returns {undefined}
 */
module.exports = function requestHandler(req, res) {
  const sessionId = req.sessionId;
  diva
    .getAttributes(sessionId)
    .then(attributes => ({
      initials: attributes['irma-demo.idin.idin.initials'][0],
      familiyname: attributes['irma-demo.idin.idin.familyname'][0],
      bsn: attributes['irma-demo.MijnOverheid.root.BSN'][0],
    }))
    .then((address) => {
      if (!req.params.id) {
        throw new Error('No policyId specified.');
      }
      return Policy
        .query()
        .delete()
        .where('owner', '=', address)
        .andWhere('id', '=', req.params.id);
    })
    .then(numDeleted =>
      res
        .status(200)
        .send({
          success: true,
          message: 'Deleted',
          numDeleted,
          id: req.params.id,
        }),
    )
    .catch((err) => {
      console.log(err);
      return res
        .status(400)
        .send({
          success: false,
          message: 'Something went wrong',
        });
    });
};
