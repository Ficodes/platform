// Meteor package import
import { Template } from 'meteor/templating';
// Import collections
import { Apis } from '/apis/collection';
import { Organizations } from '/organizations/collection';
import { ApiMetadata } from '/metadata/collection';

Template.apiSettings_details.onCreated(function () {
  const instance = this;
  // subscribe to data
  instance.subscribe('allOrganizations');
});

Template.apiSettings_details.helpers({
  apisCollection () {
    return Apis;
  },
});

Template.apiSettings_details.events({
  'click #save-settings': (event, templateInstance) => {
    // Get current API id
    const apiId = templateInstance.data.api._id;

    // Get the selected organization id
    const organizationId = templateInstance.$('[name=organizationId]').val();

    // Try to find organization document
    const organization = Organizations.findOne(organizationId);
    // Try to find metadata document of current API
    const metadata = ApiMetadata.findOne({ apiBackendId: apiId });
    // Get metadata id otherwise it will be empty string
    const metadataId = metadata ? metadata._id : '';

    // If organization document was found
    if (organization) {
      // Fill a object withorganization information for metadata
      const values = {
        organization: {
          name: organization.name,
          description: organization.description,
        },
        contact: {
          name: organization.contact.person,
          phone: organization.contact.phone,
          email: organization.contact.email,
        },
      };

      // If metadata document already exists
      if (metadata) {
        // Update information
        ApiMetadata.update(metadataId, { $set: values });
      } else {
        // Add information about API
        values.apiBackendId = apiId;
        // Create a new one metadata
        ApiMetadata.insert(values);
      }
    } else {
      // Was selected the first item in list then delete metadata information
      ApiMetadata.remove(metadataId);
    }
  },
});
