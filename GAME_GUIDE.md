# Endless Requiem Game Guide

This guide explains how to run the game, where the important files are, and how to customize rooms, dialogue, creature encounters, endings, items, crafting, cooking, sanity, and GitHub updates.

---

## 1. How to Run the Game Locally

Do **not** open the game by double-clicking `index.html`. That opens it as a `file:///` page, which can break saving, navigation, and browser permissions.

Open PowerShell or terminal inside the project folder and run:

```powershell
python -m http.server 8000
```

Then open this in Chrome:

```txt
http://localhost:8000
```

If the page looks wrong after replacing files, press:

```txt
Ctrl + F5
```

That hard-refreshes the browser cache.

---

## 2. Important File Map

```txt
index.html                  Main title screen
styles.css                  Main visual style for the whole game
GAME_GUIDE.md               This guide

rooms/content_config.js     Easy story config: dialogue, creatures, endings
rooms/items.js              Item definitions
rooms/recipe.js             Crafting and cooking recipes
rooms/inventory.js          Inventory logic and pickup saving
rooms/crafting.js           Crafting/cooking screen logic
rooms/rooms_system.js       Safe rooms, rest, rituals, enemy spawn unlocks
rooms/enemies.js            Enemy/combat behavior
rooms/sanity.js             Sanity system and sanity bar
rooms/script.js             Shared room behavior
rooms/endings.html          Ending page

rooms/*.html                Individual room pages
images/                     Room background images
images/items/               Item icons
images/entities/            Creature/entity portrait images
sounds/                     Sound files
```

For most story edits, start with:

```txt
rooms/content_config.js
```

For most item edits, start with:

```txt
rooms/items.js
```

For crafting/cooking edits, start with:

```txt
rooms/recipe.js
```

---

## 3. How Saves Work

The game saves data in browser `localStorage`.

It remembers things like:

- inventory items,
- picked-up room items,
- sanity,
- completed dialogue choices,
- completed creature encounters,
- story flags,
- enemy spawn unlock progress,
- last room.

If you need to reset while testing, use **Delete Progress** on the title screen.

If something looks stuck because of old saves, also try Chrome DevTools:

```txt
Application → Local Storage → localhost:8000 → Clear
```

---

## 4. How to Add or Edit Room Dialogue

Open:

```txt
rooms/content_config.js
```

Find:

```js
window.ROOM_DIALOGUES = {
```

Each room has a section like this:

```js
"road.html": {
  kicker: "Outside",
  prompt: "The road behind you no longer feels connected to any place you know. How do you steady yourself?",
  options: [
    {
      label: "Watch the horizon",
      response: "The sky gives you no answer, but its emptiness is strangely calming.",
      sanity: 1
    }
  ]
}
```

### Add a New Room Dialogue Choice

Add a new object inside the `options` list:

```js
{
  label: "Inspect the strange mirror",
  response: "The mirror shows the room behind you, but you are not standing in it.",
  sanity: -2,
  setFlag: "inspected_strange_mirror"
}
```

### Dialogue Option Fields

```js
label
```

The text shown on the button.

```js
response
```

The text shown after the player clicks it.

```js
sanity
```

Positive raises sanity. Negative lowers sanity.

```js
setFlag
```

Saves that this choice happened. Endings and other choices can check this later.

```js
requiresFlag
```

Choice only works if a previous flag exists.

```js
requiresItem
```

Choice only works if the player has an item.

```js
consumesItem
```

If `true`, the required item is removed.

```js
itemReward
```

Gives the player an item.

```js
goToRoom
```

Sends the player to a different room after clicking.

---

## 5. How to Add a Room Interaction

Room interactions are just dialogue choices with effects.

Example: search a floorboard and get a key.

```js
{
  label: "Search under the loose floorboard",
  response: "Your fingers close around something cold.",
  itemReward: "silver_key",
  itemRewardAmount: 1,
  setFlag: "found_floorboard_key"
}
```

Example: require an item.

```js
{
  label: "Light the blue candle",
  requiresItem: "lighter",
  consumesItem: false,
  response: "The flame burns blue and the room exhales.",
  sanity: 3,
  setFlag: "lit_blue_candle"
}
```

Example: use up an item.

```js
{
  label: "Offer the flowers",
  requiresItem: "flowers",
  consumesItem: true,
  response: "The room softens after the offering.",
  sanity: 5,
  setFlag: "offered_flowers"
}
```

Example: move to another room.

```js
{
  label: "Step through the mirror",
  response: "The glass gives way like water.",
  goToRoom: "window.html",
  setFlag: "entered_mirror"
}
```

---

## 6. How to Add Creature / Entity Encounters

Open:

```txt
rooms/content_config.js
```

Find:

```js
window.ENTITY_ENCOUNTERS = {
```

A creature encounter looks like this:

```js
"corridor1.html": {
  id: "veiled_child_corridor",
  chance: 1,
  repeats: false,
  requiresEnemyUnlocked: true,

  name: "The Veiled Child",
  image: "../images/entities/veiled_child.png",
  imageAlt: "A veiled child standing in the hallway",
  imagePosition: "left",
  imageFit: "cover",

  subtitle: "A small figure stands at the far end of the hall.",
  prompt: "It raises one hand. Not a wave. Not a warning. A question.",

  options: [
    {
      label: "Speak gently",
      response: "The child lowers its hand. The hallway feels shorter.",
      sanity: 3,
      setFlag: "comforted_veiled_child"
    }
  ]
}
```

### Creature Encounter Fields

```js
id
```

A unique save ID for this creature event.

```js
chance
```

`1` means 100% chance. `0.5` means 50% chance.

```js
repeats
```

`false` means it only appears once per run.

```js
requiresEnemyUnlocked
```

`true` means it only appears after the creature/spawn part of the story has started.

```js
requiresFlag
```

Encounter only appears if a flag exists.

```js
forbiddenFlag
```

Encounter does not appear if that flag exists.

---

## 7. How to Add Creature Interactions

Creature interactions go inside a creature encounter’s `options` list.

### Peaceful Interaction

```js
{
  label: "Bow your head",
  response: "The creature mirrors you. For one second, it almost looks human.",
  sanity: 5,
  setFlag: "respected_hall_creature"
}
```

### Hostile Interaction

```js
{
  label: "Fight the thing",
  response: "You strike first. It reels back, shrieking without a mouth.",
  sanity: -3,
  setFlag: "fought_hall_creature",
  swapImage: "../images/entities/hall_creature_wounded.png"
}
```

### Trade Interaction

```js
{
  label: "Give it the music box",
  requiresItem: "music_box",
  consumesItem: true,
  response: "It cradles the music box like a wounded bird and leaves a key behind.",
  sanity: 6,
  itemReward: "master_key",
  itemRewardAmount: 1,
  setFlag: "gave_music_box_to_creature"
}
```

---

## 8. How to Add Entity Portrait Images

Put your image file here:

```txt
images/entities/
```

Then reference it in `rooms/content_config.js`:

```js
image: "../images/entities/my_creature.png",
imageAlt: "A tall pale creature in the hallway",
imagePosition: "left",
imageFit: "cover"
```

### `cover` vs `contain`

```js
imageFit: "cover"
```

Fills the portrait box. Good for face/portrait art. It may crop the edges.

```js
imageFit: "contain"
```

Shows the entire image. Good for tall full-body creatures. It may leave empty space.

### Change the Image After a Choice

Inside a creature option:

```js
swapImage: "../images/entities/my_creature_angry.png"
```

---

## 9. How to Add Endings

Open:

```txt
rooms/content_config.js
```

Find:

```js
window.ENDING_CONFIG = [
```

Add an ending object:

```js
{
  id: "mirror_escape",
  title: "Ending: Mirror Escape",
  minSanity: 50,
  requiresFlags: ["entered_mirror"],
  text: "The mirror opens like water, and you step through into a dawn that does not recognize you.",
  note: "Found by entering the mirror with enough sanity."
}
```

### Ending Conditions

```js
minSanity: 70
```

Player needs at least 70 sanity.

```js
maxSanity: 20
```

Player needs 20 sanity or less.

```js
requiresFlags: ["flag_one", "flag_two"]
```

All listed flags must be true.

```js
anyFlags: ["flag_one", "flag_two"]
```

At least one listed flag must be true.

```js
forbiddenFlags: ["bad_flag"]
```

Ending will not happen if this flag exists.

```js
requiresItems: ["silver_key"]
```

Player must have the item.

The first matching ending wins, so put special endings higher in the list and default endings lower.

---

## 10. How to Add Items

Open:

```txt
rooms/items.js
```

Add an item inside `window.ITEMS`.

Example material item:

```js
"Moon Thread": {
  id: "moon_thread",
  name: "Moon Thread",
  icon: "../images/items/moon_thread.svg",
  color: "#bfcaff",
  description: "A pale thread that glows when the room goes quiet.",
  stack: 20
}
```

Example consumable sanity item:

```js
"Warm Milk": {
  id: "warm_milk",
  name: "Warm Milk",
  icon: "../images/items/warm_milk.svg",
  color: "#fff1d0",
  description: "A small comfort. Restores sanity.",
  stack: 4,
  type: "consumable",
  sanity: 10,
  heal: 0
}
```

Important: the `id` is what the game uses in recipes, pickups, rewards, and item requirements.

---

## 11. How to Add Item Icons

Put icon files here:

```txt
images/items/
```

Then set the item icon path:

```js
icon: "../images/items/moon_thread.svg"
```

SVG, PNG, JPG, and WEBP can work in the browser.

---

## 12. How to Add Pickups to a Room

Open the room file, for example:

```txt
rooms/trail.html
```

Add a button inside the `.center-box`:

```html
<button class="btn" onclick="pickupItem('silver_key')">
  Pick up Silver Key
</button>
```

For multiple items:

```html
<button class="btn" onclick="pickupItem('stale_bread', 2)">
  Pick up Stale Bread
</button>
```

The pickup system saves picked-up items, so if the player leaves and returns, the same pickup will stay gone.

Use the item ID, not the item name.

Correct:

```js
pickupItem('silver_key')
```

Wrong:

```js
pickupItem('Silver Key')
```

---

## 13. How to Add Crafting or Cooking Recipes

Open:

```txt
rooms/recipe.js
```

Crafting recipe example:

```js
{
  station: "crafting",
  category: "Sanity",
  output: { id: "comfort_candle", amount: 1 },
  ingredients: [
    { id: "wax", amount: 1 },
    { id: "lighter", amount: 1, consume: false }
  ]
}
```

Cooking recipe example:

```js
{
  station: "cooking",
  category: "Cooking",
  output: { id: "warm_beans", amount: 1 },
  ingredients: [
    { id: "canned_beans", amount: 1 },
    { id: "lighter", amount: 1, consume: false }
  ]
}
```

### Reusable Tools

If an ingredient should be required but not used up, add:

```js
consume: false
```

Example:

```js
{ id: "lighter", amount: 1, consume: false }
```

---

## 14. How to Use the Inventory System

The inventory button opens a panel with:

- item search,
- category/type filter,
- sorting,
- item counts,
- item descriptions,
- use buttons for consumables.

Consumable items are controlled in `rooms/items.js`:

```js
{
  type: "consumable",
  sanity: 10
}
```

If an item has `type: "consumable"` and a `sanity` value, it can be used from the inventory to restore sanity.

---

## 15. How to Control Sanity

Sanity is handled in:

```txt
rooms/sanity.js
```

But you usually control sanity through config choices.

Raise sanity:

```js
sanity: 5
```

Lower sanity:

```js
sanity: -5
```

Consumable item sanity:

```js
"Lavender Tea": {
  id: "lavender_tea",
  type: "consumable",
  sanity: 12
}
```

---

## 16. Safe Rooms, Rest, and Rituals

Open:

```txt
rooms/rooms_system.js
```

Safe rooms are here:

```js
const safeRooms = ["lore.html", "bedroom.html", "crafting.html"];
```

Rooms where rest only works once are here:

```js
const restOnceRooms = ["lore.html", "bedroom.html"];
```

Ritual buttons are also in `rooms/rooms_system.js`.

Example existing ritual:

```js
if (current === "bedroom.html") {
  config = {
    id: "bedroom_music_box_ritual_v1",
    label: "Play the Music Box Ritual (+25 sanity)",
    item: "music_box",
    amount: 25,
    success: "The music box plays one clean note. Your breathing slows."
  };
}
```

---

## 17. How Creature Spawning Unlocks

Creature spawns are locked at first.

In `rooms/rooms_system.js`, these rooms can unlock enemy spawns:

```js
const enemyUnlockRooms = ["corridor1.html", "attic.html", "bedroom.html", "playroom.html", "window.html", "lockedin.html"];
```

The front door also unlocks creature spawns when the player uses the Silver Key.

To make creatures unlock in a different room, add that room file name to `enemyUnlockRooms`.

---

## 18. How to Add a New Room

1. Copy an existing room file, like:

```txt
rooms/road.html
```

2. Rename it:

```txt
rooms/mirror_room.html
```

3. Change its title, subtitle, background image, and buttons.

4. Add a dialogue config in `rooms/content_config.js`:

```js
"mirror_room.html": {
  kicker: "Mirror Room",
  prompt: "The room reflects everything except you.",
  options: [
    {
      label: "Touch the mirror",
      response: "The glass ripples like water.",
      sanity: -1,
      setFlag: "touched_mirror"
    }
  ]
}
```

5. Add navigation to it from another room:

```html
<button class="btn" onclick="goToRoom('mirror_room.html')">
  Go to Mirror Room
</button>
```

---

## 19. How to Change the Visual Style

Most visuals are in:

```txt
styles.css
```

Good sections to edit:

```txt
LIMINAL / ETHEREAL GLOBAL STYLE
ROOM CONTENT
BUTTONS
INVENTORY
DIALOGUE PANELS
ENTITY ENCOUNTERS
CRAFTING / COOKING SCREEN
```

Be careful with:

```css
position
z-index
pointer-events
transform
```

Those can affect button hitboxes and layout.

---

## 20. How to Add Sounds

Put sound files here:

```txt
sounds/
```

Room pages use this on the body tag:

```html
<body data-audio="ambient.mp3" data-sanity="high">
```

Change `ambient.mp3` to your sound file name.

The player may need to click or press a key before sound starts because browsers block autoplay.

---

## 21. How to Push Changes to GitHub

Inside your project folder:

```powershell
git status
```

Add changes:

```powershell
git add .
```

Commit:

```powershell
git commit -m "Update game content"
```

Push:

```powershell
git push origin main
```

If Git says your branch is behind, run:

```powershell
git pull origin main
```

Then push again:

```powershell
git push origin main
```

If Git says permission denied, you are probably logged into the wrong GitHub account or need collaborator access.

---

## 22. Common Troubleshooting

### The page is blank or buttons do not appear

Use the local server:

```powershell
python -m http.server 8000
```

Open:

```txt
http://localhost:8000
```

Then hard refresh:

```txt
Ctrl + F5
```

### I get `/favicon.ico 404`

That is harmless. It only means the browser could not find a tab icon.

### Old items or old room state are stuck

Click **Delete Progress** on the title screen.

Or clear localStorage in DevTools.

### My item does not show in inventory

Check that:

1. the item exists in `rooms/items.js`,
2. you used the item `id`, not the display name,
3. the icon path is correct.

### My recipe does not work

Check that:

1. every ingredient ID exists in `rooms/items.js`,
2. the output item ID exists,
3. commas are correct between objects,
4. the file has no JavaScript syntax errors.

### My creature image does not show

Check that:

1. the image file is inside `images/entities/`,
2. the path starts with `../images/entities/`,
3. the filename spelling and extension match exactly.

Example:

```js
image: "../images/entities/my_creature.png"
```

### My creature never appears

Check:

```js
chance: 1
```

If it has:

```js
requiresEnemyUnlocked: true
```

then it will not appear until enemy spawns are unlocked.

If it has:

```js
repeats: false
```

and you already saw it once, clear progress or change the `id` while testing.

---

## 23. Quick Copy-Paste Templates

### Room Choice Template

```js
{
  label: "Choice text",
  response: "What happens after the player clicks it.",
  sanity: 1,
  setFlag: "unique_flag_name"
}
```

### Item Reward Template

```js
{
  label: "Take the hidden object",
  response: "You find something hidden in the dust.",
  itemReward: "silver_key",
  itemRewardAmount: 1,
  setFlag: "found_hidden_object"
}
```

### Requires Item Template

```js
{
  label: "Use the lighter",
  requiresItem: "lighter",
  consumesItem: false,
  response: "A blue flame wakes in the dark.",
  sanity: 2,
  setFlag: "used_lighter_here"
}
```

### Creature Encounter Template

```js
"room_name.html": {
  id: "unique_creature_event_id",
  chance: 1,
  repeats: false,
  requiresEnemyUnlocked: false,

  name: "Creature Name",
  image: "../images/entities/creature.png",
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
}
```

### Ending Template

```js
{
  id: "ending_id",
  title: "Ending: Ending Name",
  minSanity: 50,
  requiresFlags: ["important_flag"],
  text: "Ending story text goes here.",
  note: "Short explanation of how this ending was reached."
}
```

---

## 24. Best Editing Rule

When adding new content, edit one thing at a time and test it before adding the next thing.

A good order is:

1. Add item in `items.js`.
2. Test if it appears when picked up.
3. Add recipe or interaction using that item.
4. Test again.
5. Add ending or creature flag conditions.
6. Test again.

That makes bugs much easier to find.

---

## 16. Firebase Accounts and Cloud Saves

The game now has a Firebase-ready account system.

Important files:

```txt
account.html                  Account/login page
rooms/firebase_config.js       Firebase config placeholder
rooms/cloud_save.js            Sign in, sign up, cloud save, cloud load
```

### How to Enable Firebase

1. Go to the Firebase Console.
2. Create a project.
3. Add a **Web App** to the project.
4. Copy the Firebase config object.
5. Open:

```txt
rooms/firebase_config.js
```

6. Paste your config into `firebaseConfig`.
7. Change:

```js
enabled: false
```

to:

```js
enabled: true
```

8. In Firebase, enable **Authentication → Email/Password**.
9. Enable **Firestore Database**.

### Firestore Rules for Testing

For early testing only, you can use rules like this so signed-in players can only read/write their own save:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /playerSaves/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### What Cloud Save Stores

Cloud save uploads the same browser save keys the game already uses:

```txt
inventory
sanity_v1
pickedUpItems_v1
gameProgress_v1
content_flags_v1
lastRoom
lastEnding_v1
trophies_v2
trophy_stats_v1
dialogue_used_...
entity_seen_...
rested_...
ritual_...
```

The game still works without Firebase. Firebase only adds account sign-in and cloud saving.

---

## 17. Achievements / Trophies

Important files:

```txt
rooms/achievements_config.js   Easy trophy definitions
rooms/trophies.js              Trophy system logic
rooms/trophies.html            Trophy display page
```

### Add a Trophy

Open:

```txt
rooms/achievements_config.js
```

Add a new object inside `window.ACHIEVEMENTS`:

```js
{
  id: "found_lavender",
  name: "A Softer Scent",
  icon: "🌿",
  description: "Pick up lavender.",
  condition: { type: "item", id: "lavender" }
}
```

### Trophy Condition Types

Unlock when a stat reaches a number:

```js
condition: { type: "stat", stat: "pickups", min: 5 }
```

Unlock when the player has an item:

```js
condition: { type: "item", id: "silver_key" }
```

Unlock when a story flag exists:

```js
condition: { type: "flag", id: "respected_veiled_child" }
```

Unlock when sanity is high or low:

```js
condition: { type: "sanity", min: 90 }
condition: { type: "sanity", max: 20 }
```

Unlock when a room has been visited:

```js
condition: { type: "room", room: "attic.html" }
```

Unlock when an ending has been reached:

```js
condition: { type: "ending", id: "silver_release" }
```

### Manually Unlock a Trophy from Code

```js
Trophies.unlock("my_trophy_id");
```

### Reset Trophies

Go to:

```txt
rooms/trophies.html
```

and click **Reset Trophies**.


## V19 Note: Trophy Page Scroll + “The House Always Wins”

The trophies page has its own scroll override so it can show long achievement lists without being clipped by the room-page layout.

A new achievement was added in `rooms/achievements_config.js`:

```js
{
  id: "house_always_wins",
  name: "The House Always Wins",
  icon: "♠️",
  description: "Reach an ending where the house gets the final word.",
  condition: { type: "anyEnding", ids: ["the_house_keeps_you", "hostile_house"] }
}
```

Use `condition: { type: "anyEnding", ids: ["ending_id_1", "ending_id_2"] }` when one trophy should unlock from multiple possible endings.

---

## Settings System

The game now has a settings page:

```txt
rooms/settings.html
```

You can open it from the title screen, inventory, or directly:

```txt
http://localhost:8000/rooms/settings.html
```

Settings are saved in localStorage under:

```txt
game_settings_v1
```

### Settings included

- **Mute audio** — turns game audio off.
- **Master volume** — controls all game audio volume.
- **Ambient volume** — controls room/background ambience.
- **Reduced motion / effects** — disables or greatly reduces flickers, particles, transitions, and other animated effects.
- **Show sanity meter** — lets you hide the sanity bar without disabling sanity mechanics.
- **UI size** — small, normal, or large.
- **Text speed** — saved for future dialogue/typewriter features.
- **Auto cloud save** — saved as a placeholder setting for future Firebase auto-save wiring.
- **Export Local Save** — copies/surfaces the player’s local save data.
- **Import Local Save** — restores local save data from an exported save.
- **Clear Local Save** — clears local progress but keeps settings.

### Using settings in code

The settings helper is in:

```txt
rooms/settings.js
```

Common examples:

```js
const settings = GameSettings.load();
```

```js
GameSettings.get("showSanity");
```

```js
GameSettings.set("reducedEffects", true);
```

```js
const volume = GameSettings.audioVolume("ambient");
```

### Hide the sanity meter by default

Open `rooms/settings.js` and change the default:

```js
showSanity: true
```

to:

```js
showSanity: false
```

### Reduced effects

When reduced effects is on, the page gets this class:

```txt
settings-reduced-effects
```

The CSS uses that class to hide particles and reduce animation.


## V21 Consolidated Fix Notes

This build includes the current fixes in one place:

- Firebase config supports both `GAME_FIREBASE_CONFIG` and `FIREBASE_GAME_CONFIG`.
- `cloud_save.js` uses `getFirebaseGameConfig()` consistently.
- Account sign-in should work after a hard refresh if Firebase Authentication and Firestore are enabled.
- Trophies page scrolls and does not show the sanity meter.
- Clear Mind no longer unlocks at the main menu. It unlocks only after sanity drops below 90 and is restored to 90 or higher.
- Crafting/cooking, inventory, settings, achievements, entity portraits, endings, and unified choices are included.

### Firestore Rules for This Build

This version saves cloud data to `playerSaves/USER_UID`, so use:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return signedIn() && request.auth.uid == userId;
    }

    match /playerSaves/{userId} {
      allow create, read, update, delete: if isOwner(userId);
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
