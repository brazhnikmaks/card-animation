import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";

var vertexShader$1 = /* glsl */ `
varying vec2 vUv;

uniform float displacement;
uniform vec3 uPerspectiveTopLeft;
uniform vec3 uPerspectiveTopRight;
uniform vec3 uPerspectiveBottomLeft;
uniform vec3 uPerspectiveBottomRight;

#include <common>

float mapRange(float value, float low1, float high1, float low2, float high2) {
    return low2 + (value - low1) * (high2 - low2) / (high1 - low1);
}

float when_lt(float x, float y) {
  return max(sign(y - x), 0.0);
}

void main() {
    vUv = uv;

    vec3 transformed = position;

    transformed.z += sin(uv.x * PI) * displacement;

    // top right
    transformed.xyz += uv.x * uv.y * uPerspectiveTopRight;
    // top left
    transformed.xyz += (1. - uv.x) * uv.y * uPerspectiveTopLeft;
    // bottom right
    transformed.xyz += uv.x * (1. - uv.y) * uPerspectiveBottomRight;
    // bottom left
    transformed.xyz += (1. - uv.x) * (1. - uv.y) * uPerspectiveBottomLeft;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.);
}
`;

var fragmentShader$1 = /* glsl */ `
uniform sampler2D map;
uniform float opacity;
uniform float globalOpacity;
uniform float globalAlphaSpeed;

varying vec2 vUv;

void main() {
    vec4 mapTexel = texture2D(map, vUv);
    mapTexel.a *= opacity;
    mapTexel.a *= globalOpacity * globalAlphaSpeed;

    if(mapTexel.a < 0.001){

    	discard;
    }

    gl_FragColor = mapTexel;
}
`;

var vertexShaderShadow$1 = /* glsl */ `
varying vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
`;

var fragmentShaderShadow$1 = /* glsl */ `
uniform float opacity;
uniform float globalOpacity;
uniform float globalAlphaSpeed;
uniform vec2 uRotation;
uniform vec3 diffuse;
uniform sampler2D map;


varying vec2 vUv;

#include <common>

void main() {
    vec4 mapTexel = texture2D(map, vUv);

    vec3 diffuseColor = diffuse;
    float o = opacity;

    // o = (o * sin(vUv.x * PI));
    // o = (o * sin(vUv.y * PI));

    // o *= mix(1. - vUv.x, vUv.x, uRotation.y);
    // o *= mix(vUv.y, 1. - vUv.y, uRotation.x);

    o *= mapTexel.a * globalOpacity * globalAlphaSpeed;

    if(o < 0.001){
    	discard;
    }

    gl_FragColor = vec4(mapTexel.rgb, o);
}
`;

const Scene = (function() {
  //gobals
  let WebGL = {
    container: null,
    textures: {}
  };

  let Mouse = {
    moveTimer: undefined,
    moved: false,
    dx: 0.5,
    dy: 0.5
  };

  let Scroll = {
    dy: 0
  };

  const lerp = (start, end) => (1 - 0.1) * start + 0.1 * end;

  function renderScene() {
    //canvas
    WebGL.canvasWidth = window.innerWidth;
    WebGL.canvasHeight = window.innerHeight;

    //renderer
    WebGL.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    WebGL.renderer.setSize(WebGL.canvasWidth, WebGL.canvasHeight);
    // this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    WebGL.container.appendChild(WebGL.renderer.domElement);

    //camera
    WebGL.cameraAspect = WebGL.canvasWidth / WebGL.canvasHeight;
    WebGL.camera = new THREE.PerspectiveCamera(45, WebGL.cameraAspect, 0.1, 60);
    WebGL.camera.position.set(0, 0, 10);
    WebGL.camera.lookAt(new THREE.Vector3());

    //scene
    setScene();

    //controls
    // new OrbitControls(WebGL.camera, WebGL.renderer.domElement);
  }

  function windowResize() {
    WebGL.canvasWidth = window.innerWidth;
    WebGL.canvasHeight = window.innerHeight;
    WebGL.renderer.setSize(WebGL.canvasWidth, WebGL.canvasHeight);
  }

  function setScene() {
    //scene
    WebGL.scene = new THREE.Scene();

    //axis scene
    var axesHelper = new THREE.AxesHelper(5);
    WebGL.scene.add(axesHelper);

    //load models
    loadComponents(() => {
      createCard();
      update();
    });
  }

  function loadComponents(callback) {
    WebGL.textureLoader = new THREE.TextureLoader();

    const textures = [
      { path: `/card-front-sq.png`, name: "card-front" },
      { path: `/card-shadow.png`, name: "card-shadow" },
      { path: `/card-back-sq.png`, name: "card-back" },
      { path: `/card-front-black-shadow.png`, name: "card-front-black" }
    ];

    Promise.all(textures.map(texture => loadTexture(texture))).then(() => {
      callback();
    });
  }

  function loadTexture({ path, name }) {
    return new Promise((resolve, reject) => {
      WebGL.textureLoader.load(
        `img/${path}`,
        texture => {
          WebGL.textures[name] = texture;
          resolve();
        },
        undefined,
        error => {
          reject();
        }
      );
    });
  }

  function createCard() {
    WebGL.card = {
      width: 1614,
      height: 1024
    };

    const geometry = new THREE.PlaneBufferGeometry(1, 1, 20, 2);

    const frontMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader$1,
      fragmentShader: fragmentShader$1,
      uniforms: {
        map: { value: WebGL.textures["card-front"] },
        globalAlphaSpeed: { value: 1 },
        opacity: { value: 1 },
        displacement: { value: 0.5 },
        uPerspectiveTopLeft: { value: new THREE.Vector3() },
        uPerspectiveTopRight: { value: new THREE.Vector3() },
        uPerspectiveBottomLeft: { value: new THREE.Vector3() },
        uPerspectiveBottomRight: { value: new THREE.Vector3() },
        globalOpacity: { value: 1 }
      },
      transparent: true
      // wireframe: true
    });

    const backMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader$1,
      fragmentShader: fragmentShader$1,
      uniforms: {
        map: { value: WebGL.textures["card-back"] },
        opacity: { value: 1 },
        displacement: { value: 0.5 },
        uPerspectiveTopLeft: { value: new THREE.Vector3() },
        uPerspectiveTopRight: { value: new THREE.Vector3() },
        uPerspectiveBottomLeft: { value: new THREE.Vector3() },
        uPerspectiveBottomRight: { value: new THREE.Vector3() },
        globalOpacity: { value: 1 },
        globalAlphaSpeed: { value: 1 }
      },
      transparent: true,
      side: THREE.BackSide
    });

    WebGL.card.container = new THREE.Object3D();
    WebGL.card.axis = new THREE.Object3D();

    WebGL.card.axis.add(WebGL.card.container);

    WebGL.card.front = new THREE.Mesh(geometry, frontMaterial);
    WebGL.card.container.add(WebGL.card.front);

    WebGL.card.back = new THREE.Mesh(geometry, backMaterial);
    WebGL.card.container.add(WebGL.card.back);

    WebGL.card.front.position.z = 2;
    WebGL.card.back.position.z = 2;

    const scaling = WebGL.card.height / WebGL.card.width;

    WebGL.card.front.scale.set(3, 3 * scaling, 1);
    WebGL.card.back.scale.copy(WebGL.card.front.scale);

    WebGL.scene.add(WebGL.card.container);

    WebGL.scene.add(
      new THREE.Mesh(
        new THREE.SphereBufferGeometry(2, 32, 32),
        new THREE.MeshLambertMaterial({
          color: 0x00ff40
        })
      )
    );

    const parameters = {
      rotateX: 0,
      rotateY: 0
    };

    const gui = new dat.GUI();

    const folder1 = gui.addFolder("Rotate");

    folder1
      .add(parameters, "rotateX")
      .name("Rotate X")
      .step(0.02)
      .onChange(value => {
        WebGL.card.container.rotation.x = parseFloat(value);
      });

    folder1
      .add(parameters, "rotateY")
      .name("Rotate Y")
      .step(0.02)
      .onChange(value => {
        WebGL.card.container.rotation.y = parseFloat(value);
      });
  }

  function update() {
    WebGL.card.container.rotation.y -= 0.05;
    if (Mouse.moved) {
      updateCardRotate();
    }

    // updateCardScroll();

    WebGL.renderer.render(WebGL.scene, WebGL.camera);
    requestAnimationFrame(update);
  }

  function updateCardRotate() {
    WebGL.card.container.rotation.y = lerp(
      WebGL.card.container.rotation.y,
      Mouse.dx
    );
    WebGL.card.container.rotation.x = lerp(
      WebGL.card.container.rotation.x,
      Mouse.dy
    );
    // WebGL.card.front.material.uniforms.displacement.value = lerp(
    //   WebGL.card.front.material.uniforms.displacement.value,
    //   Mouse.dy * 1.5
    // );
    // WebGL.card.back.material.uniforms.displacement.value = lerp(
    //   WebGL.card.back.material.uniforms.displacement.value,
    //   Mouse.dy * 1.5
    // );
  }

  function updateCardScroll() {
    if (Scroll.dy < 0.5) {
      WebGL.card.container.rotation.z = lerp(
        WebGL.card.container.rotation.z,
        -Scroll.dy * 15
      );
    } else {
      WebGL.card.container.rotation.z = lerp(
        WebGL.card.container.rotation.z,
        Scroll.dy * 15
      );
    }
    if (Scroll.dy < 0.5) {
      WebGL.card.container.position.y = lerp(
        WebGL.card.container.position.y,
        -Scroll.dy * 10
      );
      WebGL.card.container.rotation.y -= 0.02;
    } else if (Scroll.dy > 0.9) {
      WebGL.card.container.position.x = lerp(
        WebGL.card.container.position.x,
        10
      );
    } else {
      WebGL.card.container.position.y = lerp(
        WebGL.card.container.position.y,
        0
      );
      WebGL.card.container.position.x = lerp(
        WebGL.card.container.position.x,
        0
      );
    }
  }

  function onMouseMove(e) {
    if (Mouse.moveTimer !== undefined) {
      clearTimeout(Mouse.moveTimer);
      Mouse.moved = true;
      Mouse.dx = e.clientX / WebGL.canvasWidth - 0.5;
      Mouse.dy = e.clientY / WebGL.canvasHeight - 0.5;
    }
    Mouse.moveTimer = setTimeout(() => {
      Mouse.moved = false;
    }, 2000);
  }

  function onScroll() {
    Scroll.dy = window.pageYOffset / Scroll.max;
    console.log(Scroll.dy);
  }

  function events() {
    document.addEventListener("mousemove", e => {
      onMouseMove(e);
    });
    // window.addEventListener("scroll", e => {
    //   onScroll(e);
    // });
  }

  return {
    init: function(settings) {
      if (!settings) return;
      WebGL = { ...WebGL, ...settings };

      Scroll.max = WebGL.container.parentNode.clientHeight - window.innerHeight;

      renderScene();
      events();

      window.addEventListener("resize", windowResize);
    }
  };
})();

export default Scene;
