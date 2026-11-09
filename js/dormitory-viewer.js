import { Box3, Vector3 } from "three";
import { GLTFLoader } from "../vendor/three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "../vendor/meshopt/meshopt_decoder.mjs";
import { createStage } from "./map3d/scene.js";
import { attachControls } from "./map3d/interaction.js";

export async function mountDormitory(container, id, signal, onChange) {
  if (signal.aborted) return;

  // Fetch separately so closing the archive can cancel the transfer.
  const asset = new URL(`../assets/buildings/residences/${id}.glb`, import.meta.url);
  const response = await fetch(asset, { signal });
  if (!response.ok) throw new Error(`Dormitory model HTTP ${response.status}`);
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const { scene: model } = await loader.parseAsync(await response.arrayBuffer(), "");
  let stage;
  let controls;

  function dispose() {
    if (stage) {
      controls?.dispose();
      stage.dispose();
      stage = null;
    } else {
      const materials = new Set();
      model.traverse(object => {
        if (!object.isMesh) return;
        object.geometry.dispose();
        materials.add(object.material);
      });
      materials.forEach(material => material.dispose());
    }
  }

  if (signal.aborted) {
    dispose();
    return;
  }

  try {
    const bounds = new Box3().setFromObject(model);
    const scale = 84 / bounds.getSize(new Vector3()).length();
    model.scale.setScalar(scale);
    model.position.copy(bounds.getCenter(new Vector3()).multiplyScalar(-scale));
    stage = createStage(container);
    stage.addModel(model);
    controls = attachControls(stage);
  } catch (error) {
    dispose();
    throw error;
  }

  signal.addEventListener("abort", dispose, { once: true });
  stage.renderer.domElement.addEventListener("webglcontextlost", () => {
    signal.removeEventListener("abort", dispose);
    dispose();
    onChange(null);
  }, { once: true });
  onChange(controls);
}
