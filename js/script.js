"option strict";

/*
Program to demonstrate display of simple 3D meshes in the browser using the 
Babylon.js library.

The meshes themselves are in the form of JSON files, which are taken 
from the Github site - https://github.com/davidmigloz/3d-engine

The functionality is:
- To display the chosen mesh in 3D on the browser
- To display the meshes in Wireframe, Flat Shading or Smooth Shading
- To display the normals to the triangles
- To stop or continue the rotation. 

By Amarnath S, amarnaths.codeproject@gmail.com, March 2021
*/

let canvas = document.getElementById("canvas3d");
// Load the 3D engine
let engine = new BABYLON.Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
});

const cone = document.getElementById("cone");
const cube = document.getElementById("cube");
const cylinder = document.getElementById("cylinder");
const icosphere = document.getElementById("icosphere");
const suzanne = document.getElementById("suzanne");
const torus = document.getElementById("torus");
const uvsphere = document.getElementById("uvsphere");

const wire = document.getElementById("wire");
const flat = document.getElementById("flat");
const smooth = document.getElementById("smooth");

const rotationCheck = document.getElementById("rotation");
const normalCheck = document.getElementById("normals");

let scene;
let mesh;
let lineSystem = [];
let lineMesh;

let suzanneObject;
let positions = [];
let indices = [];
let normals = [];
let uvs = [];
let verticesStep = 8;

let meshFile = "../resources/Suzanne.json";

window.onload = init;

function init() {
  wire.addEventListener("click", handleOption, false);
  flat.addEventListener("click", handleOption, false);
  smooth.addEventListener("click", handleOption, false);
  cone.addEventListener("click", handleOption, false);
  cube.addEventListener("click", handleOption, false);
  cylinder.addEventListener("click", handleOption, false);
  icosphere.addEventListener("click", handleOption, false);
  suzanne.addEventListener("click", handleOption, false);
  torus.addEventListener("click", handleOption, false);
  uvsphere.addEventListener("click", handleOption, false);
  normalCheck.addEventListener("click", showNormals, false);

  suzanne.checked = true;
  meshFile = "../resources/Suzanne.json";

  readSuzanne();

  engine.runRenderLoop(function () {
    if (scene) {
      scene.render();

      if (!rotationCheck.checked) {
        mesh.rotation.x += 0.005;
        mesh.rotation.y += 0.005;
        mesh.rotation.z += 0.005;

        lineMesh.rotation.x += 0.005;
        lineMesh.rotation.y += 0.005;
        lineMesh.rotation.z += 0.005;
      }
    }
  });

  document.getElementById("flat").click();
}

function handleOption() {
  if (cone.checked) {
    meshFile = "../resources/Cone.json";
  } else if (cube.checked) {
    meshFile = "../resources/Cube.json";
  } else if (cylinder.checked) {
    meshFile = "../resources/Cylinder.json";
  } else if (icosphere.checked) {
    meshFile = "../resources/ICOSphere.json";
  } else if (suzanne.checked) {
    meshFile = "../resources/Suzanne.json";
  } else if (torus.checked) {
    meshFile = "../resources/torus.json";
  } else {
    meshFile = "../resources/UVSphere.json";
  }

  readSuzanne();
}

function showNormals() {
  if (normalCheck.checked) {
    lineMesh.setEnabled(true);
  } else {
    lineMesh.setEnabled(false);
  }
}

function readSuzanne() {
  var oXHR = new XMLHttpRequest();

  // Initiate request.
  oXHR.onreadystatechange = reportStatus;
  oXHR.open("GET", meshFile, true);
  oXHR.send();

  function reportStatus() {
    if (oXHR.readyState == 4) {
      console.log(oXHR.responseText);
      suzanneObject = JSON.parse(oXHR.responseText);
      // Check if request is complete.

      let meshes = suzanneObject.meshes[0];
      let vertices = meshes.vertices;
      let verticesCount = vertices.length / 8;

      positions.length = 0;
      normals.length = 0;
      uvs.length = 0;
      for (let index = 0; index < verticesCount; ++index) {
        let x = vertices[index * verticesStep];
        let y = vertices[index * verticesStep + 1];
        let z = vertices[index * verticesStep + 2];
        positions.push(x, y, z);
        let nx = vertices[index * verticesStep + 3];
        let ny = vertices[index * verticesStep + 4];
        let nz = vertices[index * verticesStep + 5];
        normals.push(nx, ny, nz);
        let u = vertices[index * verticesStep + 6];
        let v = vertices[index * verticesStep + 7];
        uvs.push(u, v);
      }

      indices = meshes.indices;
      scene = createScene();

      normalCheck.checked = false;
      showNormals();
    }
  }
}

// CreateScene function that creates and return the scene
var createScene = function () {
  // Create a basic BJS Scene object
  let scene = new BABYLON.Scene(engine);
  // Create a FreeCamera, and set its position to {x: 0, y: 5, z: -10}
  let camera = new BABYLON.FreeCamera(
    "camera1",
    new BABYLON.Vector3(0, 0.5, -4),
    scene
  );
  // Target the camera to scene origin
  camera.setTarget(BABYLON.Vector3.Zero());
  // Attach the camera to the canvas
  camera.attachControl(canvas, false);
  // Create a basic light, aiming 0, 1, 0 - meaning, to the sky
  let light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );

  mesh = new BABYLON.Mesh("custom", scene);
  let vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;

  if (smooth.checked) {
    vertexData.normals = normals;
  }

  let myMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
  myMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);
  myMaterial.specularColor = new BABYLON.Color3(0.6, 0.6, 0.87);

  if (wire.checked) {
    myMaterial.wireframe = true;
  }

  vertexData.applyToMesh(mesh);
  mesh.material = myMaterial;

  computeNormals();

  // Return the created scene
  return scene;
};

// the canvas/window resize event handler
window.addEventListener("resize", function () {
  engine.resize();
});

function computeNormals() {
  lineSystem.length = 0;
  let indexStep = 3;

  for (let i = 0; i < indices.length / indexStep; ++i) {
    let i1 = indices[indexStep * i];
    let i2 = indices[indexStep * i + 1];
    let i3 = indices[indexStep * i + 2];
    i1 = indexStep * i1;
    i2 = indexStep * i2;
    i3 = indexStep * i3;
    let x1 = positions[i1];
    let y1 = positions[i1 + 1];
    let z1 = positions[i1 + 2];
    let x2 = positions[i2];
    let y2 = positions[i2 + 1];
    let z2 = positions[i2 + 2];
    let x3 = positions[i3];
    let y3 = positions[i3 + 1];
    let z3 = positions[i3 + 2];

    // Centroid of the triangle
    let xCent = (x1 + x2 + x3) / 3.0;
    let yCent = (y1 + y2 + y3) / 3.0;
    let zCent = (z1 + z2 + z3) / 3.0;

    let vec1 = new BABYLON.Vector3(x2 - x1, y2 - y1, z2 - z1);
    let vec2 = new BABYLON.Vector3(x3 - x1, y3 - y1, z3 - z1);

    let norm1 = BABYLON.Vector3.Cross(vec2, vec1);
    let norm2 = BABYLON.Vector3.Normalize(norm1);

    let factor = 12;

    let xEnd = xCent + norm2.x / factor;
    let yEnd = yCent + norm2.y / factor;
    let zEnd = zCent + norm2.z / factor;

    let lineArr = [
      new BABYLON.Vector3(xCent, yCent, zCent),
      new BABYLON.Vector3(xEnd, yEnd, zEnd),
    ];

    lineSystem.push(lineArr);
  }

  lineMesh = BABYLON.MeshBuilder.CreateLineSystem("linesystem", {
    lines: lineSystem,
  });
}
