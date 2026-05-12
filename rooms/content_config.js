/* rooms/content_config.js
   EASY CUSTOM CONTENT FILE

   Change this file when you want to edit dialogue, entity encounters, or endings.
   You usually do NOT need to edit rooms/script.js for story content.

   Sanity:
   - positive sanity raises sanity
   - negative sanity lowers sanity

   Flags:
   - setFlag: "flag_name" marks a story choice as happened
   - requiresFlag: "flag_name" means this option/encounter/ending needs that flag

   Interactions you can add to options:
   - response: text shown in the response box
   - sanity: positive or negative sanity change
   - setFlag: saves a story flag
   - requiresItem: needs an inventory item before it can be clicked
   - consumesItem: true removes the required item
   - itemReward: gives the player an item
   - itemRewardAmount: amount of the rewarded item
   - goToRoom: moves to another room after the response
   - message: popup message

   Entity images:
   - image: path to a portrait file, for example "../images/entities/my_entity.png"
   - imageAlt: alt text for the portrait
   - imagePosition: "left" or "right"
   - imageFit: "cover" or "contain"
   - option.swapImage: change the portrait after choosing that option

   Creature voice settings:
   - voice.pitch: higher/lower gibberish voice
   - voice.speed: faster/slower chatter
   - voice.volume: 0 to 1
   - voice.texture: "soft", "airy", "rough", or "thin"
   - option.voice: overrides the creature voice for that one choice
   - option.voiceText: alternate text used only for the sound
*/

window.ROOM_DIALOGUES = {
  "lore.html": {
    kicker: "Threshold",
    prompt: "The air is cold on this fall day. grandpa left you this estate after he disappeared, some people say its haunted and who goes in never comes out.. those are just rumors right?",
    options: [
      { label: "Test", goToRoom: "entitytest.html" },

    ]
  },

  "road.html": {
    kicker: "Outside",
    prompt: "The road behind you no longer feels connected to any place you know. How do you steady yourself?",
    options: [
      { label: "Watch the horizon", response: "The sky gives you no answer, but its emptiness is strangely calming.", sanity: 1 },
      { label: "Call for the taxi", response: "Your voice breaks apart in the dusk. No engine answers, only distance.", sanity: -1, setFlag: "called_for_taxi" },
      { label: "Touch the gravel", response: "The cold ground reminds you that at least one thing here is real enough to sting your fingertips.", sanity: 1, setFlag: "grounded_self" }
    ]
  },

  "trail.html": {
    kicker: "Trail",
    prompt: "The path in the dim light feels more remembered than walked. What keeps you moving?",
    options: [
      { label: "Follow instinct", response: "Instinct has no map, but it does have momentum. Sometimes that is enough.", sanity: 1 },
      { label: "Search the grass", response: "The bent stalks suggest someone passed this way long ago—or very recently.", sanity: 0, setFlag: "noticed_tracks" },
      { label: "Listen to the insects", response: "Their rhythm keeps the dark from closing all the way around you.", sanity: 1 }
    ]
  },

  "door.html": {
    kicker: "Front Door",
    prompt: "The house is close enough to touch, yet it keeps itself apart from you. What feeling wins?",
    options: [
      { label: "Feel unwelcome", response: "The wood gives off a chill that feels intentional. You withdraw your hand.", sanity: -1 },
      { label: "Feel curious", response: "Curiosity is easier to carry than fear. The lock suddenly seems less like a barrier and more like a dare.", sanity: 1, setFlag: "curious_about_house" },
      { label: "Feel expected", response: "For one uneasy second, you are sure the house knew your name before you arrived.", sanity: 0, setFlag: "felt_expected" }
    ]
  },

  "corridor1.html": {
    kicker: "Hallway",
    prompt: "The corridor seems longer every time you blink. What do you focus on?",
    options: [
      { label: "Count the doorframes", response: "Numbers keep the hallway from stretching too far. Counting becomes a kind of prayer.", sanity: 1 },
      { label: "Follow the cold draft", response: "The draft leads nowhere, but it does prove the house is breathing around you.", sanity: 0, setFlag: "followed_draft" },
      { label: "Stand perfectly still", response: "For a heartbeat, the corridor feels suspended with you, both of you listening for the other.", sanity: 2, setFlag: "stood_still" }
    ]
  },

  "bedroom.html": {
    kicker: "Bedroom",
    prompt: "The room still carries the outline of a life interrupted. Which memory do you test?",
    options: [
      { label: "Sit on the bed", response: "The mattress sinks as if it remembers a body that never truly left. You rise a little lighter.", sanity: 3, setFlag: "sat_on_bed" },
      { label: "Breathe in the lavender", response: "The scent is thin but persistent. It gathers your thoughts and ties them into something gentler.", sanity: 4 },
      { label: "Open the drawer", response: "Dust stirs like old breath. Inside is nothing useful, only the intimate proof that someone once stayed here.", sanity: 0, setFlag: "opened_drawer" }
    ]
  },

  "playroom.html": {
    kicker: "Playroom",
    prompt: "A room built for noise has become one of the quietest places in the house. What do you do?",
    options: [
      { label: "Nudge the pool table", response: "The soft clack rolls through the room and dies quickly, as if swallowed by thick carpet that is not there.", sanity: 0 },
      { label: "Stare at the dark TV", response: "For a second you think the glass reflects a room behind you, not the one you stand in.", sanity: -2, setFlag: "saw_tv_reflection" },
      { label: "Recall a happy room", response: "You force a kinder memory over the scene. It does not fit perfectly, but it helps.", sanity: 2, setFlag: "held_happy_memory" }
    ]
  },

  "window.html": {
    kicker: "Window",
    prompt: "Snow falls on the wrong side of reality. How do you meet the sight?",
    options: [
      { label: "Touch the pane", response: "The glass is colder than winter and warmer than fear. Your pulse slows against it.", sanity: 2 },
      { label: "Look away quickly", response: "You break the spell, but not before the room seems disappointed in you.", sanity: -1 },
      { label: "Trace the falling flakes", response: "Watching the impossible pattern gives your thoughts somewhere harmless to drift.", sanity: 1, setFlag: "watched_wrong_snow" }
    ]
  },

  "attic.html": {
    kicker: "Attic",
    prompt: "Dust and rafters hold the house at its highest, most forgotten edge. What do you dare here?",
    options: [
      { label: "Kneel in the dust", response: "The dust rises around you like a pale veil. In the quiet, grief and comfort feel almost identical.", sanity: 2, setFlag: "knelt_in_attic" },
      { label: "Call out softly", response: "Your voice returns a half-second late, carrying the faint shape of another speaker.", sanity: -2, setFlag: "called_in_attic" },
      { label: "Listen to the wood", response: "The beams creak in patient intervals. It sounds almost like an old lullaby with the words removed.", sanity: 1 }
    ]
  },

  "lockedin.html": {
    kicker: "Locked In",
    prompt: "The shut door resists with more than weight. How do you answer being kept?",
    options: [
      { label: "Brace your shoulder", response: "The impact leaves your body sore and your certainty thinner. The door barely notices.", sanity: -1 },
      { label: "Press your ear to the wood", response: "You hear a delicate shifting on the other side, like someone deciding whether to leave or enter.", sanity: 0, setFlag: "heard_behind_door" },
      { label: "Laugh once, softly", response: "The sound makes the room feel less in control of you. Not safe—just less certain.", sanity: 1, setFlag: "laughed_at_house" }
    ]
  },
};

/* ENTITY ENCOUNTERS
   Each room may have one encounter.
   chance: 1 means always appears once. 0.5 means 50% chance.
   repeats: false means it appears once per run.

   Portrait example:
   image: "../images/entities/veiled_child.png"
   imageAlt: "A veiled child standing in the hallway"
   imagePosition: "left"
   imageFit: "cover"
*/
window.ENTITY_ENCOUNTERS = {
  "corridor1.html": {
    id: "veiled_child_corridor",
    chance: 1,
    repeats: false,
    requiresEnemyUnlocked: true,
    name: "The Veiled Child",
    image: "../images/entities/veiled_child.svg",
    imageAlt: "A veiled child standing at the end of the hallway",
    imagePosition: "left",
    imageFit: "cover",
    voice: {
      enabled: true,
      pitch: 1.45,
      speed: 1.15,
      volume: 0.45,
      texture: "soft"
    },
    subtitle: "A small figure stands at the far end of the hall, face hidden by something too thin to be cloth.",
    prompt: "It raises one hand. Not a wave. Not a warning. A question.",
    options: [
      {
        label: "Ask what it wants",
        response: "The child tilts its head. A voice like dust says, “To be noticed without being followed.”",
        sanity: -1,
        setFlag: "spoke_to_veiled_child"
      },
      {
        label: "Bow your head",
        response: "The figure mirrors you. For one merciful second, the hallway becomes shorter.",
        sanity: 3,
        setFlag: "respected_veiled_child"
      },
      {
        label: "Step toward it",
        response: "It unfolds backward into the dark. Something in the walls clicks its tongue.",
        sanity: -3,
        setFlag: "followed_veiled_child",
        swapImage: "../images/entities/veiled_child.svg"
      }
    ]
  },

  "bedroom.html": {
    id: "woman_in_silver",
    chance: 1,
    repeats: false,
    name: "The Woman in Silver",
    image: "../images/entities/woman_in_silver.svg",
    imageAlt: "A moonlit woman in a silver gown",
    imagePosition: "right",
    imageFit: "cover",
    voice: {
      enabled: true,
      pitch: 1.05,
      speed: 0.9,
      volume: 0.42,
      texture: "airy"
    },
    subtitle: "A woman made of moonlight sits where the room is darkest. Her hair floats as though underwater.",
    prompt: "She looks at the music box, then at you, and waits.",
    options: [
      {
        label: "Offer the music box",
        requiresItem: "music_box",
        consumesItem: false,
        response: "She touches the music box without moving her hand. A gentle note blooms in your chest.",
        sanity: 8,
        setFlag: "comforted_woman_in_silver",
        swapImage: "../images/entities/woman_in_silver.svg"
      },
      {
        label: "Ask who lived here",
        response: "“Everyone who could not leave,” she says. “And everyone who returned by remembering.”",
        sanity: 0,
        setFlag: "asked_about_house"
      },
      {
        label: "Refuse to speak",
        response: "She smiles like a candle going out. The room becomes colder by degrees.",
        sanity: -2,
        setFlag: "ignored_woman_in_silver"
      }
    ]
  },

  "attic.html": {
    id: "attic_keeper",
    chance: 1,
    repeats: false,
    requiresEnemyUnlocked: true,
    name: "The Attic Keeper",
    image: "../images/entities/attic_keeper.svg",
    imageAlt: "A tall keeper folding paper birds in the attic",
    imagePosition: "left",
    imageFit: "cover",
    voice: {
      enabled: true,
      pitch: 0.55,
      speed: 0.75,
      volume: 0.6,
      texture: "rough"
    },
    subtitle: "Something tall kneels beneath the rafters, folding scraps of old paper into birds.",
    prompt: "It does not look hostile. It looks busy. It offers you one paper bird.",
    options: [
      {
        label: "Accept the paper bird",
        response: "The paper bird is warm. It dissolves before you can keep it, but leaves courage in its place.",
        sanity: 5,
        setFlag: "accepted_paper_bird"
      },
      {
        label: "Ask for a way out",
        response: "The Keeper points down. Then inward. Then at your hands.",
        sanity: 1,
        setFlag: "keeper_hint"
      },
      {
        label: "Burn the paper bird",
        requiresItem: "lighter",
        consumesItem: false,
        response: "The Keeper stops folding. Every paper bird in the attic turns its head toward you.",
        sanity: -6,
        setFlag: "angered_attic_keeper"
      }
    ]
  },

  "window.html": {
    id: "snow_voice",
    chance: 1,
    repeats: false,
    name: "The Voice in the Snow",
    image: "../images/entities/snow_voice.svg",
    imageAlt: "A face suggested by snow and frost",
    imagePosition: "right",
    imageFit: "cover",
    voice: {
      enabled: true,
      pitch: 1.25,
      speed: 0.85,
      volume: 0.35,
      texture: "thin"
    },
    subtitle: "The falling snow arranges itself into words only when you stop trying to read them.",
    prompt: "A voice presses softly against the glass from the wrong side of the weather.",
    options: [
      {
        label: "Write your name in the fog",
        response: "Your name appears backwards on the outside of the window before your finger finishes moving.",
        sanity: -1,
        setFlag: "wrote_name_on_window"
      },
      {
        label: "Ask if it is cold",
        response: "“No,” the voice says. “Only far away.”",
        sanity: 2,
        setFlag: "pitied_snow_voice"
      },
      {
        label: "Close your eyes",
        response: "With your eyes closed, the snowfall sounds like someone turning pages.",
        sanity: 2,
        setFlag: "trusted_without_looking"
      }
    ]
  },
      "entitytest.html": {
  id: "test",
  chance: 1,
  repeats: false,
  requiresEnemyUnlocked: false,

  name: "Test",
  image: "../images/entities/placeholder.png",
  imageAlt: "Describe the creature image",
  imagePosition: "left",
  imageFit: "cover",

  subtitle: "A short atmospheric description.",
  prompt: "What does it want from the player?",

  options: [
    {
      label: "Speak gently",
      response: "The creature relaxes.",
      sanity: 3,
      setFlag: "spoke_gently_to_creature"
    },
    {
      label: "Attack",
      response: "The creature recoils, but the room turns colder.",
      sanity: -4,
      setFlag: "attacked_creature",
      swapImage: "../images/entities/creature_angry.png"
    }
   ]
   voice: {
  enabled: true,
  pitch: 1.45,
  speed: 1.15,
  volume: 0.45,
  texture: "soft"
}
}
};

/* ENDINGS
   The first matching ending wins.
   Requirements:
   - minSanity / maxSanity
   - requiresFlags: all must be true
   - anyFlags: at least one must be true
   - forbiddenFlags: none of these can be true
   - requiresItems: inventory must contain these items
*/
window.ENDING_CONFIG = [
  {
    id: "silver_release",
    title: "Ending: Silver Release",
    minSanity: 70,
    requiresFlags: ["comforted_woman_in_silver", "respected_veiled_child"],
    text: "You do not defeat the house. You understand it. The rooms loosen around you like hands opening in sleep, and the front door becomes only wood again. When you step outside, dawn has no color yet—but it is real.",
    note: "High sanity + kindness toward the house’s entities."
  },
  {
    id: "paper_bird_escape",
    title: "Ending: Paper Bird",
    minSanity: 45,
    requiresFlags: ["accepted_paper_bird"],
    text: "The paper bird returns in the final hallway, made now of dust and moonlight. It leads you through a door that was never on any wall. You escape, but some nights you wake with folded paper under your tongue.",
    note: "Accepted help from the Attic Keeper."
  },
  {
    id: "the_house_keeps_you",
    title: "Ending: The House Keeps You",
    maxSanity: 20,
    text: "You stop looking for the exit when the rooms begin calling you by familiar names. The house does not hurt you. It gives you a place in the pattern. Another door. Another breath. Another light left on for someone else.",
    note: "Very low sanity."
  },
  {
    id: "hostile_house",
    title: "Ending: Every Room Turns",
    anyFlags: ["angered_attic_keeper", "followed_veiled_child"],
    text: "The house remembers every unkindness, every reckless step, every answer given too loudly. The rooms tilt. The hallways gather teeth. You run until running becomes part of the architecture.",
    note: "Angered or chased the wrong entities."
  },
  {
    id: "ordinary_escape",
    title: "Ending: Ordinary Door",
    text: "You find the front door again after what might have been minutes or years. It opens without drama. Outside, the road is waiting. You leave, carrying the uneasy knowledge that some places only let you go because they know you will remember them.",
    note: "Default ending."
  }
];
