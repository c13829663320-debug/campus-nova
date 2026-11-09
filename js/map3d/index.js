import { GLTFLoader } from "../../vendor/three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "../../vendor/meshopt/meshopt_decoder.mjs";
import { createStage } from "./scene.js";
import { attachControls } from "./interaction.js";
import { createLabels } from "./labels.js";

const MODEL = new URL("../../assets/campus3d/campus.glb", import.meta.url).href;

export async function mountCampusMap(container, { places, onSelect, onUnavailable }) {
  let stage;
  try {
    stage = createStage(container);
  } catch {
    onUnavailable("设备未开启 WebGL，当前显示模型预览");
    return null;
  }

  try {
    const model = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(MODEL);
    stage.addModel(model.scene);
  } catch (error) {
    console.warn("Campus model could not load", error);
    stage.dispose();
    onUnavailable("模型暂未加载，当前显示模型预览");
    return null;
  }

  const labels = createLabels(stage, places, onSelect);
  stage.onViewChange = labels.update;
  const controls = attachControls(stage);
  stage.renderer.domElement.addEventListener("webglcontextlost", () => {
    controls.dispose();
    labels.dispose();
    stage.dispose();
    onUnavailable("三维画面已中断，当前显示模型预览");
  }, { once: true });

  return {
    zoomIn: controls.zoomIn,
    zoomOut: controls.zoomOut,
    rotateView: controls.rotateView,
    resetView: controls.reset,
    focus: controls.focus,
    setVisiblePlaces: labels.setVisiblePlaces,
    setSelected: labels.setSelected
  };
}
