/**
 * Preset stylesheet configurations
 * Common CSS framework integrations
 */
export const stylesheetPresets = {
    /**
     * Tailwind CSS via CDN
     */
    tailwind: () => [{
        href: "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4", //'https://cdn.tailwindcss.com',
        attrs: { type: 'text/javascript' }
    }],
    
    /**
     * Water.css - Classless CSS framework
     */
    water: (theme = 'auto') => [{
        href: `https://cdn.jsdelivr.net/npm/water.css@2/out/${theme === "auto"? 'water':theme}.css`
    }],
    
    /**
     * Pico CSS - Minimal CSS framework
     */
    pico: () => [{
        href: 'https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css'
    }],
    
    /**
     * Open Props - CSS variables
     */
    openProps: () => [{
        href: 'https://unpkg.com/open-props'
    }, {
        href: 'https://unpkg.com/open-props/normalize.min.css'
    }],
    
    /**
     * Custom preset combiner
     */
    combine: (...presets) => {
        return presets.flatMap(preset => 
            typeof preset === 'function' ? preset() : preset
        );
    }
};