import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { get, set } from '@ember/object';

import distance from 'consul-ui/utils/distance';
import tomographyFactory from 'consul-ui/utils/tomography';
import WithFeedback from 'consul-ui/mixins/with-feedback';

const tomography = tomographyFactory(distance);

export default Route.extend(WithFeedback, {
  repo: service('nodes'),
  sessionRepo: service('session'),
  queryParams: {
    filter: {
      replace: true,
      as: 'other-filter',
    },
  },
  model: function(params) {
    const dc = this.modelFor('dc').dc.Name;
    const repo = get(this, 'repo');
    const sessionRepo = get(this, 'sessionRepo');
    return hash({
      model: repo.findBySlug(params.name, dc),
      size: 337,
    }).then(function(model) {
      // TODO: Consider loading this after initial page load
      return hash({
        ...model,
        ...{
          tomography: tomography(params.name, model.model.coordinates),
          items: get(model.model, 'Services'),
          sessions: sessionRepo.findByNode(get(model.model, 'Node'), dc),
        },
      });
    });
  },
  setupController: function(controller, model) {
    this._super(...arguments);
    controller.setProperties(model);
  },
  actions: {
    invalidateSession: function(item) {
      const dc = this.modelFor('dc').dc.Name;
      const controller = this.controller;
      const repo = get(this, 'sessionRepo');
      get(this, 'feedback').execute(
        () => {
          const node = get(item, 'Node');
          return repo.remove(item).then(() => {
            return repo.findByNode(node, dc).then(function(sessions) {
              set(controller, 'sessions', sessions);
            });
          });
        },
        `The session was invalidated.`,
        `There was an error invalidating the session.`
      );
    },
  },
});