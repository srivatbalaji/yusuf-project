// =============================================================================
// SITE-WIDE SETTINGS
// -----------------------------------------------------------------------------
// currentYear: which file in content/years/ is shown on the home page.
// archive:     past symposia shown under "Previous Years". Add one entry per year.
//              If a matching content/years/<year>.js file exists, the build also
//              publishes an archived page for it at /<year>/.
// =============================================================================

export default {
  currentYear: 2027,

  archive: [
    {
      edition: "1st Annual",
      year: null, // not stated on the 2027 flyer
      summary: null, // short recap, once provided by the organizers
      link: null, // e.g. recap page or photo album URL
    },
  ],
};
