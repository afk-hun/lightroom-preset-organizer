const fs = require("fs");
const xml2js = require("xml2js");

const CLUSTER_NAME = "PresetPro";
const startPath = "start";
//const targetPath = "target";
const targetPath = "PresetPro";

const fileRead = new Promise((res) => {
  const presets = [];
  fs.readdir(startPath, (err, files) => {
    files.forEach((file) => {
      if (file.endsWith(".xmp")) {
        presets.push(file);
      }
    });
    res(presets);
  });
});

const addClusterName = (presets, clusterName) => {
  let itemIndex = 1;
  let counter = 1;

  presets.forEach((preset) => {
    fs.readFile(startPath + "/" + preset, "utf-8", (err, presetData) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      xml2js.parseString(
        presetData,
        { explicitArray: false, ignoreAttrs: false },
        (err, result) => {
          if (err) {
            console.error("Error parsing XML:", err);
            return;
          }

          // Modify the desired attribute value
          if (
            result &&
            result["x:xmpmeta"] &&
            result["x:xmpmeta"]["rdf:RDF"] &&
            result["x:xmpmeta"]["rdf:RDF"]["rdf:Description"]["$"] &&
            result["x:xmpmeta"]["rdf:RDF"]["rdf:Description"]["$"][
              "crs:Cluster"
            ] !== undefined
          ) {
            result["x:xmpmeta"]["rdf:RDF"]["rdf:Description"]["$"][
              "crs:Cluster"
            ] = clusterName;
          }

          // Convert the modified object back to XML
          const builder = new xml2js.Builder();
          const modifiedXml = builder.buildObject(result);

          //Save the modified XML back to the file
          fs.writeFile(
            targetPath + "/" + preset,
            modifiedXml,
            "utf-8",
            (err) => {
              if (err) {
                console.error("Error writing file:", err);
              } else {
                console.log("XMP file has been successfully updated.");
              }
            }
          );
        }
      );
    });
  });
};

fileRead.then((res) => {
  addClusterName(res, CLUSTER_NAME);
});
