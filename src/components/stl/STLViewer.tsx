"use client";

import * as React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

type Props = {
  url: string;
  filename?: string;
};

export function STLViewer({ url, filename }: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0f172a");
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 120);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambient = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 1.2);
    directional.position.set(1, 1, 1);
    scene.add(directional);

    const loader = filename?.toLowerCase().endsWith(".obj") ? new OBJLoader() : new STLLoader();

    const meshMaterial = new THREE.MeshStandardMaterial({
      color: "#dbeafe",
      metalness: 0.15,
      roughness: 0.7
    });

    const handleObject = (object: THREE.Group | THREE.BufferGeometry) => {
      const mesh =
        object instanceof THREE.BufferGeometry
          ? new THREE.Mesh(object, meshMaterial)
          : object;
      if ("geometry" in mesh) {
        mesh.geometry.computeBoundingBox();
      }
      scene.add(mesh as THREE.Object3D);
      const box = new THREE.Box3().setFromObject(mesh as THREE.Object3D);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      mesh.position.x += mesh.position.x - center.x;
      mesh.position.y += mesh.position.y - center.y;
      mesh.position.z += mesh.position.z - center.z;
      camera.near = size / 100;
      camera.far = size * 100;
      camera.updateProjectionMatrix();
      camera.position.copy(center);
      camera.position.z += size * 1.5;
      controls.update();
    };

    const load = async () => {
      try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        if (loader instanceof STLLoader) {
          handleObject(loader.parse(arrayBuffer));
        } else {
          const text = new TextDecoder().decode(arrayBuffer);
          handleObject(loader.parse(text));
        }
      } finally {
        setLoading(false);
      }
    };

    void load();

    let frame = 0;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      controls.dispose();
      renderer.dispose();
      container.innerHTML = "";
    };
  }, [filename, url]);

  return (
    <div className="space-y-2">
      <div className="relative h-[480px] w-full overflow-hidden rounded-xl border">
        <div ref={ref} className="h-full w-full" />
        {loading ? <div className="absolute inset-0 grid place-items-center bg-muted/60 text-sm">Loading model...</div> : null}
      </div>
      <p className="text-sm text-muted-foreground">Interactive model preview {filename ? `for ${filename}` : ""}</p>
    </div>
  );
}
