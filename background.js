// Aegis Crypt - 3D Particle Network Background (Three.js)

(function() {
    let scene, camera, renderer, particles, lines;
    const particleCount = 120;
    const maxDistance = 120;
    const positions = [];
    const velocities = [];
    const particlePositions = new Float32Array(particleCount * 3);
    
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    
    const themeColors = {
        orange: 0xFE7F2D,
        slate: 0x233D4D,
        black: 0x000000
    };

    function init() {
        // Create container canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'bg-animation-canvas';
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.zIndex = '-1';
        canvas.style.pointerEvents = 'none';
        document.body.appendChild(canvas);

        // Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(themeColors.black, 0.0015);

        // Camera
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 400;

        // Renderer
        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(themeColors.black, 1);

        // Initialize particles data
        const boxSize = 600;
        for (let i = 0; i < particleCount; i++) {
            const x = Math.random() * boxSize - boxSize / 2;
            const y = Math.random() * boxSize - boxSize / 2;
            const z = Math.random() * boxSize - boxSize / 2;

            positions.push({ x, y, z });
            
            // Random velocities
            velocities.push({
                x: (Math.random() - 0.5) * 0.8,
                y: (Math.random() - 0.5) * 0.8,
                z: (Math.random() - 0.5) * 0.8
            });

            particlePositions[i * 3] = x;
            particlePositions[i * 3 + 1] = y;
            particlePositions[i * 3 + 2] = z;
        }

        // Particle Geometry & Material
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

        // Create a custom circle texture for smooth particles instead of square points
        const particleTexture = createCircleTexture();

        const particleMaterial = new THREE.PointsMaterial({
            color: themeColors.orange,
            size: 4.5,
            transparent: true,
            opacity: 0.85,
            map: particleTexture,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Line Connections Geometry & Material
        const lineGeometry = new THREE.BufferGeometry();
        
        // Material with vertex coloring support
        const lineMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.45,
            blending: THREE.AdditiveBlending
        });

        lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);

        // Listeners
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('mousemove', onMouseMove);

        // Start loop
        animate();
    }

    // Helper to generate a round glowing circle texture
    function createCircleTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(254, 127, 45, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    function onMouseMove(event) {
        // Normalize mouse coordinates (-1 to 1)
        targetX = (event.clientX - window.innerWidth / 2) * 0.08;
        targetY = (event.clientY - window.innerHeight / 2) * 0.08;
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);

        const boxSize = 600;
        const halfSize = boxSize / 2;

        // Update particle positions
        const positionAttr = particles.geometry.attributes.position;
        
        for (let i = 0; i < particleCount; i++) {
            let p = positions[i];
            let v = velocities[i];

            // Apply velocity
            p.x += v.x;
            p.y += v.y;
            p.z += v.z;

            // Bounce back from boundaries
            if (p.x < -halfSize || p.x > halfSize) v.x = -v.x;
            if (p.y < -halfSize || p.y > halfSize) v.y = -v.y;
            if (p.z < -halfSize || p.z > halfSize) v.z = -v.z;

            // Update flat array
            positionAttr.array[i * 3] = p.x;
            positionAttr.array[i * 3 + 1] = p.y;
            positionAttr.array[i * 3 + 2] = p.z;
        }
        
        positionAttr.needsUpdate = true;

        // Recalculate line connections dynamically
        const linePositions = [];
        const lineColors = [];
        
        const orangeColor = new THREE.Color(themeColors.orange);
        const slateColor = new THREE.Color(themeColors.slate);

        for (let i = 0; i < particleCount; i++) {
            const pi = positions[i];

            for (let j = i + 1; j < particleCount; j++) {
                const pj = positions[j];

                const dx = pi.x - pj.x;
                const dy = pi.y - pj.y;
                const dz = pi.z - pj.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                // Draw lines between particles that are close
                if (dist < maxDistance) {
                    linePositions.push(pi.x, pi.y, pi.z);
                    linePositions.push(pj.x, pj.y, pj.z);

                    // Fade colors based on distance
                    const alpha = 1.0 - (dist / maxDistance);
                    
                    // Create gradient color transition
                    const colorA = slateColor.clone().lerp(orangeColor, alpha * 0.4);
                    const colorB = slateColor.clone().lerp(orangeColor, alpha * 0.4);

                    lineColors.push(colorA.r, colorA.g, colorA.b);
                    lineColors.push(colorB.r, colorB.g, colorB.b);
                }
            }
        }

        // Update lines attributes
        lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        lines.geometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
        lines.geometry.computeBoundingSphere();

        // Parallax camera easing
        mouseX += (targetX - mouseX) * 0.05;
        mouseY += (targetY - mouseY) * 0.05;

        camera.position.x += (mouseX - camera.position.x) * 0.05;
        camera.position.y += (-mouseY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // Slowly rotate overall network
        particles.rotation.y += 0.001;
        lines.rotation.y += 0.001;

        renderer.render(scene, camera);
    }

    // Initialize when Three.js is loaded
    function checkThreeLoaded() {
        if (typeof THREE !== 'undefined') {
            init();
        } else {
            setTimeout(checkThreeLoaded, 50);
        }
    }

    checkThreeLoaded();
})();
