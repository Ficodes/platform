import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { Roles } from 'meteor/alanning:roles';

import { Settings } from '/settings/collection';
import { mailSettingsValid } from '/core/helper_functions/validate_settings';

import { _ } from 'lodash';

// Login attempt verifier to require verified email before login
export default function loginAttemptVerifier (parameters) {
  // Init user login allowed
  let userLoginAllowed = false;

  // Get reference to user object, to improve readability of later code
  const user = parameters.user;

  const settings = Settings.findOne();

  // Make sure user object exists
  if (user && user._id) {
    // Admin users are always allowed to log in
    if (Roles.userIsInRole(user._id, ['admin'])) {
      userLoginAllowed = true;
      // Check if mail settings are ok
    } else if (mailSettingsValid(settings)) {
      if (user && user.emails && (user.emails.length > 0)) {
        // Get user emails
        const emails = parameters.user.emails;

        // Check if any of user's emails are verified
        const verified = _.find(emails, (email) => { return email.verified; });

        // If no email is verified, throw an error
        if (!verified) {
          throw new Meteor.Error(500, TAPi18n.__('loginVerify_errorMessage'));
        }

        // If email is verified and parameters.allowed is true, user login is allowed
        if (verified && parameters.allowed) {
          userLoginAllowed = true;
        }
      } else {
        // User doesn't have registered email, so login not allowed
        userLoginAllowed = false;
      }
    } else {
      // Allow login without email verification if mail settings not configured correctly
      userLoginAllowed = true;
    }
  }

  return userLoginAllowed;
}
