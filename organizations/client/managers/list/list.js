import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Modal } from 'meteor/peppelg:bootstrap-3-modal';
import { _ } from 'lodash';

Template.organizationManagersList.onCreated(function () {
  // Get reference to template instance
  const instance = this;

  // Subscribe to managers public details
  instance.subscribe('organizationManagersPublicDetails');
});

Template.organizationManagersList.helpers({
  organizationManagers () {
    // Get organization document, reactively
    const organization = Template.currentData().organization;

    // Get all authorized users for current organization
    let organizationManagers = Meteor.users.find({
      _id: { $in: organization.managerIds },
    }).fetch();

    // flatten structure of users within organization managers array
    organizationManagers = _.map(organizationManagers, (user) => {
      return {
        username: user.username,
        email: user.emails[0].address,
        _id: user._id,
      };
    });

    return organizationManagers;
  },
});

Template.organizationManagersList.events({
  'click #remove-organization-manager': function (event, templateInstance) {
    // Get organization object from parent templateInstance
    const organization = templateInstance.data.organization;

    // Get user document from instance data context
    const user = this;

    // Show the confirmation dialogue, passing in user document
    Modal.show('organizationRemoveManagers', { user, organization });
  },
});
