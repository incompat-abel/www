import { init, resize, update } from "./main.mjs";


export function hook(mirage) {
	mirage.on('init', init);
	mirage.on('resize', resize);
	mirage.on_anim_frame(update);
}
