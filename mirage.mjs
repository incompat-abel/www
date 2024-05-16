export class Project {
	static Canvas2D = 0;
	static WebGL = 1;
	static WebGL2 = 2;

	constructor(path, kind) {
		this.path = path;
		this.kind = kind;
	}

	load_context(cnv) {
		switch(this.kind) {
			case Project.Canvas2D:
				return cnv.getContext('2d');
			case Project.WebGL:
				return cnv.getContext('webgl');
			case Project.WebGL2:
				return cnv.getContext('webgl2');

			default:
				throw new Error(`Mirage: Invalid project kind: ${this.kind}`);
		}
	}
};


export const Mirage = new class {
	#context = null;
	#module = null;

	#listeners = {};
	#anim_listener = () => {};
	#local_update = null;

	constructor() {
		this.running = false;
		this.canvas = null;
		this.#local_update = this.#update.bind(this); // Otherwise "this" is global
	}

	#dispatch(event, ...args) {
		for(let l in this.#listeners[event])
			this.#listeners[event][l](...args);
	}

	on(event, cb) {
		if(!(event in this.#listeners))
			this.#listeners[event] = [];

		this.#listeners[event].push(cb);
	}

	// Seperate from the on() fn because there shouldn't be multiple functions hooked per frame
	on_anim_frame(cb) {
		this.#anim_listener = cb;
	}

	set_canvas(cnv) {
		this.canvas = cnv;

		new ResizeObserver(entries => {
			this.#dispatch("resize", entries[0].contentRect.width, entries[0].contentRect.height);
		}).observe(this.canvas);
	}

	async load(project) {
		if(!(project instanceof Project))
			throw new Error("Mirage: Invalid project");
		if(this.canvas === null)
			throw new Error("Mirage: Canvas must be set before loading a project");

		this.#context = project.load_context(this.canvas);

		if(this.#context === null)
			throw new Error("Mirage: Could not create context");

		this.#module = await import(project.path);
		this.#module.hook(this);

		this.#dispatch('init', this.canvas, this.#context);
	}

	start() {
		this.running = true;
		this.#dispatch('start');
		window.requestAnimationFrame(this.#local_update);
	}

	stop() {
		this.running = false;
		this.#dispatch('stop');
	}

	#update(time) {
		this.#anim_listener(time);

		if(this.running)
			window.requestAnimationFrame(this.#local_update);
	}
}
