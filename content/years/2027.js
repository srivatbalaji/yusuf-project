// =============================================================================
// 2027 SYMPOSIUM CONTENT
// -----------------------------------------------------------------------------
// This is the only file you need to edit to update the 2027 site.
//
// Rules of thumb:
//   * Text goes inside "double quotes". Keep the comma at the end of each line.
//   * Use null for anything that is NOT confirmed yet. The site then shows a
//     clear "To be confirmed" label instead of guessing.
//   * Source of truth so far: the 2027 "Save the Date" flyers in /reference.
//   * After editing, run `npm run build && npm run check` (see README.md).
// =============================================================================

export default {
  year: 2027,
  edition: "2nd Annual",
  // The flyer spells this "Opthamology"; the standard spelling is used here.
  name: "Pacific Coast Pediatric Ophthalmology & Strabismus Symposium",

  date: {
    iso: "2027-04-24", // YYYY-MM-DD
    display: "Saturday, 24 April 2027",
    startTime: "08:00", // 24-hour clock, local time
    endTime: "17:00",
    timeDisplay: "8 AM – 5 PM",
    timezone: "America/Los_Angeles",
  },

  host: "California Pacific Medical Center",

  venue: {
    name: "California Pacific Medical Center",
    street: "711 Van Ness Ave",
    city: "San Francisco, CA 94102",
    room: null, // e.g. "Conference Center, 2nd floor"
  },

  // Shown in the hero "Save the date" banner.
  announcement:
    "Please save the date. More information about registration and the program agenda will be released.",

  about: [
    "This one-day event will bring together colleagues from across the West Coast to share insights and advancements in amblyopia & strabismus, global pediatric eye care, and innovative surgical techniques.",
    "It will be a special opportunity to connect with peers, exchange clinical pearls, and strengthen our collective expertise, while also inspiring the next generation of pediatric ophthalmologists.",
  ],

  topics: [
    "Amblyopia & strabismus",
    "Global pediatric eye care",
    "Innovative surgical techniques",
  ],

  highlights: [
    "Pediatric Ophthalmology Session",
    "Strabismus Session + Keynote Speaker",
    "CME credit",
    "Breakfast, lunch, and dinner included",
    "Dinner hosted by Azam Qureshi, M.D.",
  ],

  // People listed under "Contact us" on the flyer. Write the name exactly as it
  // should appear. Add `role` (e.g. "Course Director") once confirmed.
  // Leave `email` null until the person confirms one; they are then shown
  // under Organizers but left out of "Contact us".
  organizers: [
    { name: "Yusuf Karan", role: null, email: "yusufykaran17@berkeley.edu" },
    { name: "Azam Qureshi, M.D.", role: "Dinner host", email: "azam.qureshi@sutterhealth.org" },
    { name: "Ann Shue, M.D.", role: null, email: null },
    { name: "Dr. Simon Fung", role: null, email: "simon.fung@ucsf.edu" },
  ],

  // Only list organizations whose logo/endorsement appears on the flyer.
  // `logo` is a path inside /assets/logos (e.g. "logos/sutter-health.svg").
  // Leave it null to show the name as text until an approved logo file is added.
  logos: [{ name: "Sutter Health", logo: null }],

  // Agenda: order and times are NOT announced yet.
  // When the schedule is final: set published: true, list items in running
  // order, and fill in each `time` (e.g. "9:00 AM") and `details`.
  agenda: {
    published: false,
    items: [
      { time: null, title: "Pediatric Ophthalmology Session", details: null },
      { time: null, title: "Strabismus Session + Keynote Speaker", details: null },
      { time: null, title: "Breakfast and lunch", details: "Included." },
      { time: null, title: "Dinner hosted by Azam Qureshi, M.D.", details: "Included. Time and location to be announced." },
    ],
  },

  // Speakers: add { name, credentials, affiliation, talk, bio, photo } entries
  // only once confirmed by the organizers. Do not add bios that weren't provided.
  speakers: {
    keynote: null, // e.g. { name: "...", credentials: "M.D.", affiliation: "...", talk: "..." }
    list: [],
  },

  registration: {
    url: null, // real registration link, e.g. "https://..."
    opens: null, // e.g. "January 2027"
    fee: null,
    cmeCredits: null, // e.g. "Up to 7 AMA PRA Category 1 Credits™"
    included: ["CME credit", "Breakfast, lunch, and dinner"],
  },

  sponsorship: {
    url: null, // sponsorship prospectus or form link
    details: null,
    contact: null, // email for sponsorship inquiries, once confirmed
  },

  directions: {
    parking: null,
    transit: null,
    entrance: null, // which entrance / check-in desk to use
    accessibility: null,
  },
};
