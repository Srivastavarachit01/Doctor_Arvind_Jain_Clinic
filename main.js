/* main.js - Core application logic and WebGL integrations */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. General UI Interactivity ---

  // Mobile Menu Toggling
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle('hidden');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && e.target !== mobileMenuBtn) {
        mobileMenu.classList.add('hidden');
      }
    });

    // Close menu when clicking on links
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }

  // FAQ Accordion Toggling
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    const button = item.querySelector('button');
    if (button) {
      button.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Collapse all others
        accordionItems.forEach(i => i.classList.remove('active'));
        // Toggle current
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // Hero Parallax Effect
  const heroText = document.getElementById('hero-text');
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    if (heroText && window.innerWidth > 768) {
      heroText.style.transform = `translateY(${scrolled * 0.25}px)`;
    }
  });

  // 3D Tilt Card Effect
  const cards = document.querySelectorAll('.clay-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const xc = rect.width / 2;
      const yc = rect.height / 2;
      
      // Calculate rotation angles (max 10 degrees)
      const rotateX = -(y - yc) / (yc / 10);
      const rotateY = (x - xc) / (xc / 10);
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  // Testimonial Scroll / Drag Handler
  const track = document.getElementById('testimonial-track');
  let isDown = false;
  let startX;
  let scrollLeft;

  if (track) {
    track.addEventListener('mousedown', (e) => {
      isDown = true;
      track.classList.add('active');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    track.addEventListener('mouseleave', () => {
      isDown = false;
      track.classList.remove('active');
    });

    track.addEventListener('mouseup', () => {
      isDown = false;
      track.classList.remove('active');
    });

    track.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5; // scroll-fast
      track.scrollLeft = scrollLeft - walk;
    });

    // Auto snap behavior (gentle scrolling helper)
    track.addEventListener('scroll', () => {
      // Could implement a custom snap fallback if required, standard CSS snap handles this nicely.
    });
  }

  // Booking Form Submission via Google Apps Script Web App (Connected to Google Sheet & Email)
  const bookingForm = document.getElementById('appointment-form');
  const bookingModal = document.getElementById('booking-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

  // =========================================================================
  // GOOGLE APPS SCRIPT WEB APP CONFIGURATION (Owned by rachitsrivastava0809@gmail.com)
  // Paste your deployed Google Apps Script Web App URL below:
  // =========================================================================
  const GOOGLE_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxCo5ry0QwyLGhp-m9wNNdcTvYzMTmuDG17Qmtu8cBsesizg6MXYknKvD3y1dbMb2X0/exec';

  if (bookingForm && bookingModal) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalBtnHTML = submitBtn ? submitBtn.innerHTML : 'Book Appointment Now';

      // Retrieve form values from website fields
      const fullName = document.getElementById('form-name').value;
      const phone = document.getElementById('form-phone').value;
      const preferredDate = document.getElementById('form-date').value;
      const service = document.getElementById('form-service').value;
      const message = document.getElementById('form-message') ? document.getElementById('form-message').value : '';

      // Set button loading state & disable during request
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="inline-block animate-spin mr-2">⏳</span>
          <span>Booking Appointment...</span>
        `;
      }

      // JSON payload for Google Apps Script Web App
      const payload = {
        fullName: fullName,
        phone: phone,
        preferredDate: preferredDate,
        service: service,
        message: message
      };

      try {
        if (GOOGLE_WEB_APP_URL && !GOOGLE_WEB_APP_URL.includes('YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE')) {
          await fetch(GOOGLE_WEB_APP_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        } else {
          console.log('Google Apps Script POST simulated (Paste your Web App URL into GOOGLE_WEB_APP_URL in main.js)');
        }
      } catch (err) {
        console.error('Error submitting appointment:', err);
      } finally {
        // Restore submit button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHTML;
        }

        // Update website confirmation modal details
        document.getElementById('modal-patient-name').textContent = fullName;
        document.getElementById('modal-patient-phone').textContent = phone;
        document.getElementById('modal-booking-date').textContent = new Date(preferredDate).toLocaleDateString(undefined, {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        document.getElementById('modal-booking-service').textContent = service;

        // Show website confirmation modal
        bookingModal.classList.add('active');

        // Reset form inputs
        bookingForm.reset();
      }
    });

    // Close Modal Handler
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        bookingModal.classList.remove('active');
      });
    }

    // Close modal on background overlay click
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        bookingModal.classList.remove('active');
      }
    });
  }

  // Review Screenshot Lightbox Modal
  const screenshotModal = document.getElementById('screenshot-modal');
  const closeScreenshotBtn = document.getElementById('close-screenshot-btn');
  const lightboxImg = document.getElementById('lightbox-img');
  const screenshotButtons = document.querySelectorAll('.view-screenshot-btn');

  if (screenshotModal && lightboxImg) {
    screenshotButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const imgSrc = btn.getAttribute('data-image');
        if (imgSrc) {
          lightboxImg.src = imgSrc;
          screenshotModal.classList.add('active');
        }
      });
    });

    if (closeScreenshotBtn) {
      closeScreenshotBtn.addEventListener('click', () => {
        screenshotModal.classList.remove('active');
      });
    }

    screenshotModal.addEventListener('click', (e) => {
      if (e.target === screenshotModal) {
        screenshotModal.classList.remove('active');
      }
    });
  }

  // --- 2. WebGL Background Organic Fluid Shader ---
  initBackgroundShader();

  // --- 3. ThreeJS Interactive Doctor Avatar ---
  function safeInitThreeJS() {
    if (typeof THREE !== 'undefined') {
      initThreeJSDoctor();
    } else {
      setTimeout(safeInitThreeJS, 100);
    }
  }
  safeInitThreeJS();
});

// --- WebGL Background Shader Implementation ---
function initBackgroundShader() {
  const canvas = document.getElementById('bg-shader-canvas');
  if (!canvas) return;

  function syncSize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }

  window.addEventListener('resize', syncSize);
  syncSize();

  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    canvas.style.display = 'none'; // Fallback if WebGL isn't supported
    return;
  }

  const vs = `
    attribute vec2 a_position;
    varying vec2 v_texCoord;
    void main() {
      v_texCoord = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fs = `
    precision mediump float;
    varying vec2 v_texCoord;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    // Simplex 2D noise helpers
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = v_texCoord;
      vec2 mouse = u_mouse / max(u_resolution, vec2(1.0));
      
      // Create organic drifting medical fluid shapes
      float n1 = clamp(snoise(uv * 1.5 + u_time * 0.06), -1.0, 1.0);
      float n2 = clamp(snoise(uv * 2.5 - u_time * 0.09 + mouse * 0.3), -1.0, 1.0);
      
      // Soft clinical palette
      vec3 color1 = vec3(0.97, 0.98, 1.0); // clean bright surface
      vec3 color2 = vec3(0.92, 0.95, 0.99); // pale blue-slate
      vec3 color3 = vec3(0.94, 0.99, 0.97); // soft medical mint-teal
      
      vec3 finalColor = mix(color1, color2, n1 * 0.5 + 0.5);
      finalColor = mix(finalColor, color3, n2 * 0.25);
      
      // Drifting subtle bio-specks (use max(0.0) for GLSL pow safety on Windows DirectX drivers)
      float specks = pow(max(0.0, snoise(uv * 25.0 + u_time * 0.1)), 12.0);
      finalColor += specks * 0.04;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  function createShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  const prog = gl.createProgram();
  const vsShader = createShader(gl.VERTEX_SHADER, vs);
  const fsShader = createShader(gl.FRAGMENT_SHADER, fs);
  if (!vsShader || !fsShader) return;

  gl.attachShader(prog, vsShader);
  gl.attachShader(prog, fsShader);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(prog));
    return;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const pos = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');

  let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  window.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width && rect.height) {
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = 1.0 - (event.clientY - rect.top) / rect.height;
      mouse.x = nx * canvas.width;
      mouse.y = ny * canvas.height;
    }
  });

  function render(t) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (uTime) gl.uniform1f(uTime, t * 0.001);
    if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
    if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

// --- Three.js Interactive Doctor Avatar Implementation ---
function initThreeJSDoctor() {
  const container = document.getElementById('threejs-container-ANIMATION_HERO');
  if (!container || typeof THREE === 'undefined') return;

  // Clear previous canvas if any
  container.innerHTML = '';

  const width = container.clientWidth || 300;
  const height = container.clientHeight || 220;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
  mainLight.position.set(5, 10, 7.5);
  scene.add(mainLight);

  const fillLight = new THREE.PointLight(0x006c49, 1.8, 20); // Teal light
  fillLight.position.set(-5, 5, 5);
  scene.add(fillLight);

  // Materials
  const clayMaterial = (color) => new THREE.MeshPhongMaterial({
    color: color,
    shininess: 40,
    flatShading: false,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.1,
    roughness: 0.1,
    transmission: 0.9,
    thickness: 0.5,
    transparent: true,
    opacity: 0.4
  });

  // Cross-version geometry helper for body / pills
  const createCapsuleGeo = (r, len) => {
    if (typeof THREE.CapsuleGeometry !== 'undefined') {
      return new THREE.CapsuleGeometry(r, len, 8, 20);
    }
    return new THREE.CylinderGeometry(r * 0.9, r, len, 20);
  };

  // Doctor Representation
  const group = new THREE.Group();
  scene.add(group);

  const body = new THREE.Mesh(createCapsuleGeo(0.75, 1.3), clayMaterial(0xffffff)); // White coat
  body.position.y = -0.15;
  group.add(body);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.52, 32, 32), clayMaterial(0xf5d0bb)); // Skin tone
  head.position.y = 1.15;
  group.add(head);

  const stethoscope = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.055, 16, 100, Math.PI), clayMaterial(0x334155));
  stethoscope.position.y = 0.85;
  stethoscope.rotation.x = Math.PI / 2;
  group.add(stethoscope);

  // Floating Platform Shadow
  const shadowGeo = new THREE.CircleGeometry(1.4, 32);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.05 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.25;
  group.add(shadow);

  // Orbiting Icons Group
  const iconGroup = new THREE.Group();
  group.add(iconGroup);

  const createCross = () => {
    const cross = new THREE.Group();
    const mat = clayMaterial(0x10b981);
    cross.add(new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.14, 0.14), mat));
    cross.add(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.45, 0.14), mat));
    return cross;
  };

  const createPill = () => {
    const pill = new THREE.Group();
    const g1 = createCapsuleGeo(0.09, 0.18);
    const m1 = clayMaterial(0x006c49);
    const m2 = clayMaterial(0xffffff);
    const p1 = new THREE.Mesh(g1, m1);
    const p2 = new THREE.Mesh(g1, m2);
    p1.position.y = 0.09;
    p2.position.y = -0.09;
    pill.add(p1, p2);
    pill.rotation.z = Math.PI / 4;
    return pill;
  };

  const createHeart = () => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0, -0.1, -0.18, -0.28, -0.45, -0.28);
    shape.bezierCurveTo(-0.72, -0.28, -0.72, 0, -0.72, 0);
    shape.bezierCurveTo(-0.72, 0.28, -0.45, 0.55, 0, 0.9);
    shape.bezierCurveTo(0.45, 0.55, 0.72, 0.28, 0.72, 0);
    shape.bezierCurveTo(0.72, 0, 0.72, -0.28, 0.45, -0.28);
    shape.bezierCurveTo(0.18, -0.28, 0, -0.1, 0, 0);
    
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04 });
    const mesh = new THREE.Mesh(geo, clayMaterial(0xba1a1a)); // Red color
    mesh.scale.set(0.24, 0.24, 0.24);
    mesh.rotation.x = Math.PI;
    return mesh;
  };

  const icons = [
    { mesh: createCross(), orbit: 2.0, speed: 0.5, yOff: 0.4, phase: 0 },
    { mesh: createPill(), orbit: 1.6, speed: 0.7, yOff: -0.1, phase: 2.0 },
    { mesh: createHeart(), orbit: 2.3, speed: 0.4, yOff: 1.0, phase: 4.0 },
    { mesh: new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), glassMaterial), orbit: 1.8, speed: 0.9, yOff: 0.1, phase: 1.0 }
  ];

  icons.forEach(i => iconGroup.add(i.mesh));

  camera.position.z = 5.5;
  camera.position.y = 0.2;

  // Mouse Interactivity
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    if (rect.width && rect.height) {
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.4;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.4;
    }
  });

  function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    // Floating animation
    group.position.y = Math.sin(time * 0.6) * 0.1;
    group.rotation.y += (mouseX - group.rotation.y) * 0.05;
    group.rotation.x += (-mouseY - group.rotation.x) * 0.05;

    // Orbiting icons
    icons.forEach(i => {
      i.mesh.position.x = Math.cos(time * i.speed + i.phase) * i.orbit;
      i.mesh.position.z = Math.sin(time * i.speed + i.phase) * i.orbit;
      i.mesh.position.y = i.yOff + Math.sin(time * 2.5 + i.phase) * 0.08;
      i.mesh.rotation.x += 0.01;
      i.mesh.rotation.y += 0.015;
    });

    renderer.render(scene, camera);
  }

  animate();

  // Responsive layout sync using ResizeObserver
  function handleResize() {
    const w = container.clientWidth || 300;
    const h = container.clientHeight || 220;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(() => handleResize()).observe(container);
  } else {
    window.addEventListener('resize', handleResize);
  }
  handleResize();
}
