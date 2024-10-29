// Hooks.once("init", async function () {});

// Hooks.once("ready", async function () {
//   // TODO Workflow
//   // Reads Chat Message to check for poisoning
//   // If you use something that allows you to poison weapon (maybe add poison weapon feature?)
//   // Ask PC what weapon to poison + Add effect to that user
//   // When Attack on other character with said poison one of the following happens:
//   // Success of Any kind: Message saying X's weapon was poisoned, roll for poison
//   //   Include in that message extra data we can use to apply poison (IE Poison Description etc.) (Handle rerolls etc. in the FUTURE)
//   // Crit Fail: Remove poisoned weapon effect + add message that says (The poison was lost)
//   // Do above with a dynamic Note rule element actually ^, add tag to the roll in order to specify the poison source
//   // Remove the effect afte they roll
//   //Await the roll for that specific poison (adda max duration of like idk 5 min or something?)
//   //Maybe just add poison to a list and check for those on every roll message, and the list gets old entries purged at 10 minutes?
//   // Based on roll apply poison (at whatever relevant stage) (maybe just send the effect to chat?, or have that as an option)
//   // Nice to haves
//   // (automated grabbing poison info to support new poisons)
//   // Deal with sending damage to chat every round (think persistent damage, tbh this is how poisons can be represented in the system)
//   // Also send the save message to chat and update status based on the save?
//   // Interacting with feats
//   //Virulent Poisons
//   //etc.
// });

function translatePotionHTML(html) {
  const result = {
    save: {
      text: "", //
      option: "",
      dc: "",
      stat: "",
    },
    maxDuration: {
      text: "",
      amt: "",
      type: "",
    },
    stages: [],
  };

  const savingText = "<p><strong>Saving Throw</strong>";
  const endParagraph = "</p>";
  const endBold = "</strong>";
  const maxDuration = "<p><strong>Maximum Duration</strong>";
  const startParagraph = "<p>";

  let current = html;
  result.save.text = current
    .match(getBetweenRegex(savingText, endParagraph))[0]
    .trim();
  //Update remaining text
  current = current.split(savingText)[1].split(endParagraph);
  console.log(current)
  result.maxDuration.text = parseMaxDuration(
    current[0].match(getBetweenRegex(maxDuration, endBold))
  );
  console.log({ result })
  //Update remaining text
  console.log(current)
  current = current.map(line => line.split("<p>")[1]).filter(line => line !== '');
  current.shift();
  const stages = current;
  console.log(stages)
  let stageNum = 1;
  for (stage of stages) {
    const currStage = {
      text: "",
      conditions: [],
      damage: [],
    };
    currStage.text = stage.split(endBold)[1]?.trim();
    currStage.damage = [...currStage.text.matchAll(/@Damage\[([^\]]+)\]/g)];
    currStage.conditions = [...currStage.text.matchAll(/@UUID\[[^\}]+\}/g)]
      .map((c) => ({
        text: c,
        uuid: c.match(/(?<=@UUID\[)[^\]]+(?=\])/)[0],
        value: c.match(/(?<=\{)[^\}]+(?=\})/).match(/(\d+)/)[0],
      }));

    stageNum++;
    result.stages.push(currStage);
  }
  console.log(result)
}
function parseMaxDuration(text) {
  if (text === null) return null;
  const [amt, type] = text.split(" ");
  return { amt: Number(amt), type, text };
}

function getBetweenRegex(startText, endText) {
  // Escape special characters in startText and endText
  const escapedStart = startText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedEnd = endText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // Create the regex
  return new RegExp(`${escapedStart}(.*?)${escapedEnd}`, "s");
}
