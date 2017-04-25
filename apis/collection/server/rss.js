/* Copyright 2017 Apinf Oy
This file is covered by the EUPL license.
You may obtain a copy of the licence at
https://joinup.ec.europa.eu/community/eupl/og_page/european-union-public-licence-eupl-v11 */

// Meteor contributed packages imports
import { RssFeed } from 'meteor/raix:rssfeed';

// Collection imports
import Apis from '/apis/collection';

// calling Rss feed publication
// first argument (apis) will build the url for the feed i.e domain-name/rss/apis
RssFeed.publish('apis', function () {
  // initialization of variable feed
  const feed = this;
  // add RSS header information
  feed.setValue('title', feed.cdata('APIs feed'));
  feed.setValue('description', feed.cdata('Feed for the latest Apis that are added to the APinf.'));
  feed.setValue('link', 'https://apinf.io');
  // lastBuildDate: About RSS feed was last built with new information.
  feed.setValue('lastBuildDate', new Date());
  // pubDate: About RSS feed publish Date
  feed.setValue('pubDate', new Date());
  /* ttl: The length of time (in minutes) RSS channel can be cached
          before refreshing from the source*/
  feed.setValue('ttl', 1);
  // Look at each entry of Apis shcema and find the latest apis
  Apis.find({}, { sort: { created_at: -1 } }).forEach((api) => {
    // append an item to our feed using the .addItem() method
    feed.addItem({
      title: api.name,
      description: `${api.description}`,
      link: `https://apinf.io/apis/${api.slug}`,
      pubDate: api.created_at,
    });
  });
});
