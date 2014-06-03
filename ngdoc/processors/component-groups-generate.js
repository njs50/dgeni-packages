var _ = require('lodash');
var path = require('canonical-path');

module.exports = {
  name: 'component-groups-generate',
  description: 'Add new component-groups docs',
  runAfter: ['adding-extra-docs', 'api-docs'],
  runBefore: ['extra-docs-added'],
  process: function(docs, config, moduleMap) {

    var partialsPath = config.get('rendering.contentsFolder');
    if ( !partialsPath ) {
      throw new Error('Invalid configuration. You must provide config.rendering.contentsFolder');
    }

    var apiConfig = config.get('processing.api-docs', {
      outputPath: '${area}/${module}/${docType}/${name}.html', // The path to write an api document's page to.
      path: '${area}/${module}/${docType}/${name}' // The url for a document's page.
    });

    _.forEach(moduleMap, function(module) {

      _(module.components)
        .groupBy('docType')
        .tap(function(docTypes) {
          // We don't want the overview docType to be represented as a componentGroup
          delete docTypes.overview;
        })
        .map(function(docs, docType) {
          var templateParams = { area: module.area, module: module.name, docType: docType, name: 'index'};
          return {
            id: module.id + '.' + docType,
            docType: 'componentGroup',
            groupType: docType,
            module: module.name,
            moduleDoc: module,
            area: module.area,
            components: docs,
            outputPath: path.join(partialsPath, _.template(apiConfig.outputPath, templateParams)),
            path: _.template(apiConfig.path, templateParams)
          };
        })
        .tap(function(groups) {
          module.componentGroups = groups;
          _.forEach(groups, function(group) {
            docs.push(group);
          });
        });
    });
  }
};