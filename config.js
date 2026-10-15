// Site-wide config. Loaded first, read by the other scripts.
// features: set a flag to false to switch that feature off. A missing flag counts as on.
// Section flags (showcase, linkedinPosts) make the script do nothing, so its data file is not fetched.
window.SITE_CONFIG = {
  features: {
    showcase: true,              // "Selected work" from works.json
    linkedinPosts: false,        // "LinkedIn posts" from posts.json
    experienceSummary: false,    // description paragraph under each job in experience.json
  }
};
