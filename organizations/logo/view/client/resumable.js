import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { TAPi18n } from 'meteor/tap:i18n';
import { sAlert } from 'meteor/juliancwirko:s-alert';

import { OrganizationLogo } from '/organizations/logo/collection/collection';
import { Organizations } from '/organizations/collection';
import { fileNameEndsWith } from '/core/helper_functions/file_name_ends_with';

Meteor.startup(() => {
  // Set organization logo id to organization collection on success
  OrganizationLogo.resumable.on('fileSuccess', (file) => {
    // Get organization id
    const organization = Organizations.findOne();

    /* Step 1: Remove existing organization logo */

    // Get organization documentationFileId
    const organizationLogoFileId = organization.organizationLogoFileId;

    // Convert to Mongo ObjectID
    const objectId = new Mongo.Collection.ObjectID(organizationLogoFileId);

    // Remove Organization logo object
    OrganizationLogo.remove(objectId);

    /* Step 2: Update new organization logo */

    // Get the id from Organization logo file object
    const newOrganizationLogoFileId = file.uniqueIdentifier;

    // Update logo id field
    Organizations.update(
      organization._id,
      { $set: { organizationLogoFileId: newOrganizationLogoFileId } }
    );

    // Get success message translation
    const message = TAPi18n.__('organizationLogo_resumable_successfully_uploaded');

    sAlert.success(message);
  });

  OrganizationLogo.resumable.on('fileAdded', (file) => OrganizationLogo.insert({
    _id: file.uniqueIdentifier,
    filename: file.fileName,
    contentType: file.file.type,
  }, (err) => {
    if (err) {
      // Create & show a message about failed insert
      const message = `${TAPi18n.__('organizationLogo_resumable_errorText')} ${err}`;
      sAlert.error(message);
      return;
    }
    // Accepted extensions for images
    const acceptedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    if (fileNameEndsWith(file.file.name, acceptedExtensions)) {
      // Upload organization logo
      return OrganizationLogo.resumable.upload();
    }

    /** Otherwise **/

    /* Step 1: Inform user about error */

    // Get error message translation related to accepted extensions
    const message = TAPi18n.__('organizationLogo_resumable_acceptedExtensions');
    // Alert user of error
    sAlert.error(message);

    /* Step 2: Remove uploaded file that was NOT image */

    // Get the id from Organization logo file object
    const organizationLogoFileId = file.uniqueIdentifier;

    // Convert to Mongo ObjectID
    const objectId = new Mongo.Collection.ObjectID(organizationLogoFileId);

    // Remove Organization logo object
    OrganizationLogo.remove(objectId);
  }));
});
