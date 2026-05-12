/* rooms/achievements_config.js
   EASY TROPHY / ACHIEVEMENT CONFIG

   Add new trophies here. The trophy system checks conditions automatically.

   Condition examples:
   condition: { type: "stat", stat: "pickups", min: 1 }
   condition: { type: "item", id: "silver_key" }
   condition: { type: "flag", id: "respected_veiled_child" }
   condition: { type: "sanity", min: 90 }
   condition: { type: "room", room: "attic.html" }
   condition: { type: "ending", id: "silver_release" }
*/
window.ACHIEVEMENTS = [
  {
    id: "first_steps",
    name: "First Steps",
    icon: "🌙",
    description: "Enter your first room.",
    condition: { type: "stat", stat: "roomsVisitedTotal", min: 1 }
  },
  {
    id: "first_find",
    name: "Something in Your Pocket",
    icon: "🗝️",
    description: "Pick up your first item.",
    condition: { type: "stat", stat: "pickups", min: 1 }
  },
  {
    id: "silver_key",
    name: "A Silver Way In",
    icon: "🔑",
    description: "Obtain the Silver Key.",
    condition: { type: "item", id: "silver_key" }
  },
  {
    id: "first_craft",
    name: "Hands Remember",
    icon: "🛠️",
    description: "Craft your first item.",
    condition: { type: "stat", stat: "crafted", min: 1 }
  },
  {
    id: "first_cook",
    name: "Warmth in a Cold Place",
    icon: "🍲",
    description: "Cook your first food.",
    condition: { type: "stat", stat: "cooked", min: 1 }
  },
  {
    id: "met_entity",
    name: "Not Alone",
    icon: "👁️",
    description: "Interact with a creature/entity.",
    condition: { type: "stat", stat: "entityChoices", min: 1 }
  },
  {
    id: "gentle_guest",
    name: "Gentle Guest",
    icon: "🕯️",
    description: "Show respect to the Veiled Child.",
    condition: { type: "flag", id: "respected_veiled_child" }
  },
  {
    id: "comforted_silver",
    name: "A Note of Mercy",
    icon: "🎵",
    description: "Comfort the Woman in Silver.",
    condition: { type: "flag", id: "comforted_woman_in_silver" }
  },
  {
    id: "attic_visit",
    name: "Under the Rafters",
    icon: "🪶",
    description: "Reach the attic.",
    condition: { type: "room", room: "attic.html" }
  },
  {
    id: "clear_mind",
    name: "Clear Mind",
    icon: "💠",
    description: "Reach 90 or more sanity.",
    condition: { type: "sanity", min: 90 }
  },
  {
    id: "near_breaking",
    name: "Near Breaking",
    icon: "🕳️",
    description: "Drop to 20 or less sanity.",
    condition: { type: "sanity", max: 20 }
  },
  {
    id: "ending_seen",
    name: "The House Answers",
    icon: "🏚️",
    description: "Reach any ending.",
    condition: { type: "stat", stat: "endingsSeen", min: 1 }
  },
  {
    id: "silver_release",
    name: "Silver Release",
    icon: "🌅",
    description: "Earn the Silver Release ending.",
    condition: { type: "ending", id: "silver_release" }
  }

  ,
  {
    id: "house_always_wins",
    name: "The House Always Wins",
    icon: "♠️",
    description: "Reach an ending where the house gets the final word.",
    condition: { type: "anyEnding", ids: ["the_house_keeps_you", "hostile_house"] }
  }

];
