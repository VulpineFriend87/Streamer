/* Code by Vulpine (https://vulpine.pro) and licensed under the MIT license */

const socket = io();
        const loading = document.getElementById('loading');
        const loadingLogo = document.getElementById('loading-logo');
        const mediaContainer = document.getElementById('media-container');
        const mediaContent = document.getElementById('media-content');
        const logoContainer = document.getElementById('logo-container');
        const logo = document.getElementById('logo');

        async function animateLoading() {
            return new Promise((resolve) => {
                const loading = document.getElementById('loading');
                const loadingLogo = document.getElementById('loading-logo');

                gsap.set(loadingLogo, {
                    scale: 1,
                    rotation: 0,
                    opacity: 1
                });

                const tl = gsap.timeline({
                    onComplete: () => {
                        loading.classList.remove('active');
                        resolve();
                    }
                });

                tl.to(loadingLogo, {
                    scale: 0.8,
                    opacity: 0,
                    duration: 0.3,
                    ease: "power2.in"
                });
            });
        }

        async function showMedia(filename) {
            const mediaContent = document.getElementById('media-content');
            const logoContainer = document.getElementById('logo-container');
            const logo = document.getElementById('logo');

            loading.classList.add('active');

            if (filename) {
                
                const img = new Image();
                img.src = `/media/${filename}`;
                
                if (!mediaContainer.classList.contains('hidden')) {
                    gsap.to(mediaContent, {
                        opacity: 0,
                        scale: 0.95,
                        y: -20,
                        duration: 0.3,
                        ease: "power2.inOut"
                    });
                }
                if (!logoContainer.classList.contains('hidden')) {
                    gsap.to(logo, {
                        opacity: 0,
                        scale: 0.95,
                        y: -20,
                        duration: 0.3,
                        ease: "power2.inOut"
                    });
                }

                await Promise.all([
                    new Promise(resolve => setTimeout(resolve, 300)),
                    new Promise(resolve => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    })
                ]);

                mediaContent.src = `/media/${filename}`;
                mediaContainer.classList.remove('hidden');
                logoContainer.classList.add('hidden');

                gsap.fromTo(mediaContent, 
                    { opacity: 0, scale: 1.05, y: 20 },
                    { 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        duration: 0.4,
                        ease: "power2.out"
                    }
                );

                setTimeout(() => {
                    loading.classList.remove('active');
                }, 200);
            } else {
                
                if (!mediaContainer.classList.contains('hidden')) {
                    gsap.to(mediaContent, {
                        opacity: 0,
                        scale: 0.95,
                        y: -20,
                        duration: 0.3,
                        ease: "power2.inOut"
                    });
                }

                await new Promise(resolve => setTimeout(resolve, 300));

                mediaContainer.classList.add('hidden');
                logoContainer.classList.remove('hidden');

                gsap.fromTo(logo,
                    { opacity: 0, scale: 1.05, y: 20 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.4,
                        ease: "power2.out",
                        onComplete: () => {
                            loading.classList.remove('active');
                        }
                    }
                );
            }
        }

        fetch('/current_media')
            .then(response => response.json())
            .then(data => {
                showMedia(data.filename);
            });

        socket.on('media_changed', (data) => {
            showMedia(data.filename);
        });

        document.getElementById('logo').classList.add('visible');