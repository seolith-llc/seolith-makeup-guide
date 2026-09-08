// Single place for deployment-specific values. Nothing here is secret.
export const CONFIG = Object.freeze({
  appName: 'Blendwise',
  tagline: 'Blend wisely. Step-by-step makeup, offline.',
  version: '1.1.0',
  // Amazon Associates tracking id, e.g. "blendwise-20". Leave empty until you are enrolled;
  // links then become plain search links with no tag.
  affiliate: {
    amazonTag: '',
    amazonDomain: 'https://www.amazon.com',
  },
  // Optional HTTPS endpoint that accepts POST JSON feedback when the device is online.
  // Leave empty to keep feedback on-device only (user can still share or email it).
  feedbackEndpoint: '',
  // Email address shown in the feedback screen's "Email this" action. Leave empty to hide.
  feedbackEmail: '',
  // Public URL of the deployed app, used for invite links. Empty = current location.
  publicUrl: '',
  // Minimum age stated in the Terms.
  minimumAge: 13,
  // Skill levels used by the estimator, in order.
  skillLevels: ['beginner', 'intermediate', 'advanced'],
});
