import ky from "ky";

const kyInstance = ky.create({
  parseJson(text) {
    // convert timestamps from string to Date
    return JSON.parse(text, (key, value) => {
      if (key.endsWith("At")) return new Date(value);
      return value;
    });
  },
});

export default kyInstance;
