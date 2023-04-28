const Typograf = require('typograf');

exports.name = 'typo';
exports.outputFormat = 'html';
exports.render = function (text) {
    const tp = new Typograf({
        locale:     ['ru', 'en-US'],
        htmlEntity: { type: 'name' }
    });
    return tp.execute(text);
}
