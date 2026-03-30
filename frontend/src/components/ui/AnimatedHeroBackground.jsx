import React from 'react';

const colors = {
  textMain: "#ffffff",
  textSecondary: "#A3A3A3",
  bluePrimary: "#3b82f6",
  inputBg: "#ffffff",
  baseBg: "#e3d2bd", // Light brown
  inputShadow: "rgba(255, 255, 255, 0.1)",
};

export const AnimatedHeroBackground = ({ children }) => {
  // A collection of popular generic mall brands
  const mallBrands = [
    "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg",
    "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
    "https://upload.wikimedia.org/wikipedia/en/2/26/Rolex_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg",
    "https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg",
    "https://upload.wikimedia.org/wikipedia/commons/1/11/Levi_Strauss_%26_Co._logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/c/c5/Gucci_logo.svg",
    "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg"
  ];

  // Distribute the 10 brands across our 3 different spinning orbital layers
  const layer3Brands = mallBrands.slice(0, 4);   // Back layer
  const layer2Brands = mallBrands.slice(4, 7);   // Middle layer
  const layer1Brands = mallBrands.slice(7, 10);  // Front layer

  return (
    <div className="w-full min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.baseBg }}>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 80s linear infinite;
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 80s linear infinite;
        }
        .logo-filter {
          /* Brightness(0) turns any color black -> opacity(0.2) makes it a soft dark silhouette */
          filter: brightness(0) opacity(0.2); 
        }
      `}</style>

      <div
        className="relative w-full h-screen overflow-hidden shadow-2xl"
        style={{
          backgroundColor: colors.baseBg,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            perspective: "1200px",
            transform: "perspective(1200px) rotateX(20deg)",
            transformOrigin: "center bottom",
            opacity: 1,
          }}
        >
          {/* Layer 3 (Back Orbit) */}
          <div className="absolute inset-0 animate-spin-slow">
            <div
              className="absolute top-1/2 left-1/2 flex items-center justify-center gap-48"
              style={{
                width: "2500px",
                height: "2500px",
                transform: "translate(-50%, -50%) rotate(279.05deg)",
                zIndex: 0,
              }}
            >
              {/* Need plenty of icons to fill the 2500px circumference */}
              {[...Array(8)].map((_, i) => (
                 <img 
                    key={i} 
                    src={layer3Brands[i % layer3Brands.length]} 
                    alt="Brand" 
                    className="w-64 h-64 logo-filter absolute object-contain object-center" 
                    style={{ transform: `rotate(${i * 45}deg) translateY(-800px)` }} 
                 />
              ))}
            </div>
          </div>

          {/* Layer 2 (Middle Orbit) */}
          <div className="absolute inset-0 animate-spin-slow-reverse">
            <div
              className="absolute top-1/2 left-1/2 flex items-center justify-center"
              style={{
                width: "1500px",
                height: "1500px",
                transform: "translate(-50%, -50%) rotate(304.42deg)",
                zIndex: 1,
              }}
            >
               {[...Array(6)].map((_, i) => (
                 <img 
                    key={i} 
                    src={layer2Brands[i % layer2Brands.length]} 
                    alt="Brand" 
                    className="w-48 h-48 logo-filter absolute object-contain object-center" 
                    style={{ transform: `rotate(${i * 60}deg) translateY(-500px)` }} 
                 />
              ))}
            </div>
          </div>

          {/* Layer 1 (Front Orbit) */}
          <div className="absolute inset-0 animate-spin-slow">
            <div
              className="absolute top-1/2 left-1/2 flex items-center justify-center"
              style={{
                width: "900px",
                height: "900px",
                transform: "translate(-50%, -50%) rotate(48.33deg)",
                zIndex: 2,
              }}
            >
              {[...Array(3)].map((_, i) => (
                 <img 
                    key={i} 
                    src={layer1Brands[i % layer1Brands.length]} 
                    alt="Brand" 
                    className="w-32 h-32 logo-filter absolute object-contain object-center" 
                    style={{ transform: `rotate(${i * 120}deg) translateY(-300px)` }} 
                 />
              ))}
            </div>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${colors.baseBg} 10%, rgba(227, 210, 189, 0.6) 50%, transparent 100%)`,
          }}
        />

        {/* Content Container (Children Injection) */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-center pb-12 gap-6 overflow-y-auto">
             {children}
        </div>
      </div>
    </div>
  );
};
