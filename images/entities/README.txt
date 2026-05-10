Put your entity portrait files in this folder.

Supported examples:
- veiled_child.png
- silver_woman.webp
- attic_keeper.jpg
- snow_voice.svg

Then open rooms/content_config.js and set fields like:

image: "../images/entities/veiled_child.png",
imageAlt: "A veiled child in the corridor",
imagePosition: "left",
imageFit: "cover"

You can also swap portraits after a choice:

{
  label: "Anger it",
  response: "Its shape twists.",
  swapImage: "../images/entities/veiled_child_angry.png"
}
