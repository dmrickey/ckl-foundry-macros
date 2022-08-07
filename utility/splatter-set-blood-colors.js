// macro for setting blood colors based on pf1 types

const data = {
  aberration: "#b527d5d5",
  animal: "#a51414d8",
  construct: "#5f4d39d5",
  dragon: "#40ab26d8",
  fey: "#b304add8",
  magicalBeast: "#b71e46d8",
  humanoid: "#a51414d8",
  monstrousHumanoid: "#810808d8",
  ooze: "#0000cc6d8",
  plant: "#195d09d8",
  undead: "#260000d8",
  outsider: "#b304add8",
  vermin: "#195d09d8",
};

game.settings.set("splatter", "BloodSheetData", data);
