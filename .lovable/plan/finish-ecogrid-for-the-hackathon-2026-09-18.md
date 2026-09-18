# Finish EcoGrid for the hackathon

## Goal
Ship a polished, judge-ready EcoGrid experience whose 3D globe and controls feel strong on desktop, iPad, and phones.

## Build
1. **Finish the app**
   - Resolve the remaining type errors.
   - Add the missing mission briefing page with methodology, live-data sources, AI explanation, impact summary, and print-friendly presentation.
   - Give every page complete, unique sharing metadata.

2. **Upgrade the 3D globe**
   - Improve the Earth with richer depth, lighting, atmosphere, and clearer selected-region feedback.
   - Rebuild deployment visuals into recognizable miniature systems such as forests, turbines, solar arrays, water infrastructure, reefs, and satellites.
   - Add polished arrival motion while respecting reduced-motion settings.

3. **Optimize every screen size**
   - Reflow navigation, status controls, telemetry, globe, dossiers, model readouts, command deck, and terminal for phone, tablet, laptop, and wide desktop.
   - Preserve readable text, touch-sized controls, stable globe framing, and horizontal scrolling only where it supports dense telemetry.
   - Adapt globe pixel ratio, geometry detail, star count, and animation behavior to device capability.

4. **Verify the complete experience**
   - Run focused checks and a production build.
   - Inspect the live app at phone, tablet, desktop, and wide desktop sizes.
   - Exercise globe selection, deployment, command controls, and the briefing page; fix visible overflow or runtime errors.

## Technical notes
- Keep the current Three.js implementation and optimize it rather than introducing a second rendering stack.
- Keep live Open-Meteo data and the browser-trained forecasting model intact.
- Use procedural low-poly intervention models because they represent abstract systems rather than one branded real-world object.
