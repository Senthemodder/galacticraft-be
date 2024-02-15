import fs from "fs";
import path from "path";
/**
 * Convert a .obj file to a .json Minecraft model
 * @param {string} objFileContent
 * @param {File} texture
 * @param {string} modelId
 * @param {number} scale
 * @returns
 */
async function OBJtoMC(objFileContent, texture, modelId, scale = 1) {
  let positions = [];
  let normals = [];
  let uvs = [];
  let polys = [];
  const bones = [];

  const image = texture
    ? await getImage(texture).catch((err) => {
        console.error(err);
        return null;
      })
    : null;
  // Get width & height
  const width = image ? image.width : 32;
  const height = image ? image.height : 32;

  objFileContent.split(/\r\n|\n/g).forEach((line) => {
    const firstSpace = line.indexOf(" ");
    const defType = line.substring(0, firstSpace);
    const data = line.substring(firstSpace + 1, line.length);

    switch (defType) {
      case "v":
        positions.push(
          data
            .trim()
            .split(" ")
            .map((str, i) => (i === 0 ? -scale : scale) * Number(str))
        );
        break;
      case "vn":
        normals.push(
          data
            .trim()
            .split(" ")
            .map((str, i) => (i === 0 ? -1 : 1) * Number(str))
        );
        break;
      case "vt":
        const uv = data
          .trim()
          .split(" ")
          .map((str, i) => Number(str));
        uvs.push([uv[0], uv[1]]);
        break;
      case "f":
        const face = data
          .trim()
          .split(" ")
          .map((index) => {
            const v = Number(index.split("/")[0]);
            const vt =
              index.includes("/") && !index.includes("//")
                ? Number(index.split("/")[1])
                : Number(index.split("/")[0]);
            const vn = index.includes("//")
              ? Number(index.split("//")[1])
              : Number(
                  index.split("/").length === 3
                    ? index.split("/")[2]
                    : index.split("/")[0]
                );
            return [v - 1, vn - 1, vt - 1];
          });
        //Minecraft currently doesn't support triangular shapes
        while (face.length <= 3) face.push(face[0]);
        while (face.length > 4) face.pop();
        polys.push(face);

        break;
      // TODO: SUPPORT FOR MULTIPLE BONES
      // case 'o':
      // 	bones.push({
      // 		name: data.trim(),
      // 		poly_mesh: {
      // 			normalized_uvs: true,
      // 			positions,
      // 			normals,
      // 			uvs,
      // 			polys,
      // 		},
      // 	})
      // 	polys = []
      // 	break
    }
  });

  if (polys.length > 0) {
    bones.push({
      name: "body",
      poly_mesh: {
        normalized_uvs: true,
        positions,
        normals,
        uvs,
        polys,
      },
    });
  }

  return {
    format_version: "1.12.0",
    "minecraft:geometry": [
      {
        description: {
          identifier: modelId,
          texture_width: width,
          texture_height: height,
        },
        bones,
      },
    ],
  };
}

/**
 * A function that turns a File object into an Image object
 */
function getImage(file) {
  return self.createImageBitmap(file);
}

fs.readdirSync("./models", { withFileTypes: true })
  .filter((dir) => dir.name.endsWith(".obj"))
  .forEach((dir) => {
    if (dir.isDirectory()) return;
    const transformedName = dir.name.replace('.obj')
    const textureFiles = walkDir('./blocks').filter(file=>file.name.endsWith('.png'));
    
  });

function walkDir(dirPath) {
  let files = [];
  fs.readdirSync(dirPath, { withFileTypes: true }).forEach((dir) => {
    switch (dir.isDirectory()) {
      case true:
        files.push(...walkDir(dir.path));
        break;

      case false:
        files.push(dir);
        break;
    }
  });
  return files;
}
