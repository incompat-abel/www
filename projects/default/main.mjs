// Ik that it doesn't really work on mobile but whatever

let cnv, ctx,
	width, height;

let mx = 0, my = 0; // Mouse coords

const spacing = 40;
let vectors = [];


function resize_canvas() {
	cnv.width = width;
	cnv.height = height;
}

function angle_diff(a1, a2) {
	a1 %= Math.PI * 2;
	a2 %= Math.PI * 2;

	if(a2 - a1 > Math.PI)
		a2 -= Math.PI * 2;
	else if(a1 - a2 > Math.PI)
		a1 -= Math.PI * 2;

	return a2 - a1;
}

function lerp_angle(from, to, amt) {
	const diff = angle_diff(from, to);
	return from + diff * amt;
}


export function init(canvas, context) {
	cnv = canvas;
	ctx = context;
	resize(cnv.clientWidth, cnv.clientHeight);

	const vx = Math.ceil(width / spacing);
	const vy = Math.ceil(height / spacing);
	const ox = width % spacing / 2, oy = height % spacing / 2; // Initial offsets

	// Genereate the vector field by interpolating between angles via weighted points
	for(let y = 0; y < vy; y++) {
		for(let x = 0; x < vx; x++) {
			vectors.push({
				x: ox + spacing * x,
				y: oy + spacing * y,
				d: 0
			});
		}
	}
}

export function resize(w, h) {
	width = w;
	height = h;
	resize_canvas();
}

let delta = 0, p_time = 0;
export function update(time) {
	delta = time - p_time;
	p_time = time;

	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, width, height);

	ctx.strokeStyle = "white";
	ctx.beginPath();

	for(let v in vectors) {
		const dx = Math.cos(vectors[v].d) * spacing / 4;
		const dy = Math.sin(vectors[v].d) * spacing / 4;

		ctx.moveTo(vectors[v].x, vectors[v].y);
		ctx.lineTo(vectors[v].x + dx, vectors[v].y + dy);

		// Point at the mouse
		const mouse = Math.atan2(my - vectors[v].y, mx - vectors[v].x);
		const amt = angle_diff(vectors[v].d, mouse);
		vectors[v].d = lerp_angle(vectors[v].d, mouse, amt / (Math.PI * 2));
	}

	ctx.closePath();
	ctx.stroke();
}


window.addEventListener("mousemove", ev => {
	mx = ev.clientX;
	my = ev.clientY;
});
