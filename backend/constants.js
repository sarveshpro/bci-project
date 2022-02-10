module.exports = {
  data: "data",
  action: "blink_data",
  fotmatData: (data) => {
    return {
      ...data,
      strength: data.blinkStrength,
    };
  },
};
