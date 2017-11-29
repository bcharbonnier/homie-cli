exports.readAsString = function readAsString(stream) {
  return new Promise((resolve, reject) => {
    let buffer = "";
    stream
      .on("data", (chunk) => {
        buffer += chunk;
      })
      .on("end", () => resolve(buffer))
      .on("error", err => reject(err));
    stream.read();
  });
};
